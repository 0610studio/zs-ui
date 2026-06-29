import React, { useCallback, memo } from 'react';
import { StyleSheet, ViewProps } from 'react-native';
import { RadioOption } from '../types';
import ViewAtom from '../atoms/ViewAtom';
import ZSText, { ZSTextProps } from '../ZSText';
import ZSPressable from '../ZSPressable';
import { useTheme } from '../../context/ThemeContext';
import { SvgCheck } from '../../assets/SvgCheck';

const ROW_WIDTH: Record<1 | 2 | 3, '100%' | '50%' | '33.33%'> = {
  1: '100%',
  2: '50%',
  3: '33.33%',
};

interface RadioRowProps {
  option: RadioOption;
  index: number;
  optionCount: number;
  rowCount: 1 | 2 | 3;
  isSelected: boolean;
  isFullWidth: boolean;
  setColor: string;
  innerColor: string;
  selectColor: string;
  valueStyle?: ZSTextProps;
  selectStyle?: ZSTextProps;
  selectLabel: string;
  onSelect: (option: RadioOption) => void;
}

const RadioRow = memo(function RadioRow({
  option,
  index,
  optionCount,
  rowCount,
  isSelected,
  isFullWidth,
  setColor,
  innerColor,
  selectColor,
  valueStyle,
  selectStyle,
  selectLabel,
  onSelect,
}: RadioRowProps) {
  const isLastCol = (index + 1) % rowCount === 0;
  const isLastRow = Math.ceil((index + 1) / rowCount) === Math.ceil(optionCount / rowCount);

  return (
    <ViewAtom
      style={[
        styles.cell,
        {
          width: ROW_WIDTH[rowCount],
          paddingRight: isFullWidth ? 0 : isLastCol ? 0 : 3,
          paddingLeft: isFullWidth ? 0 : isLastCol ? 3 : 0,
          paddingBottom: isLastRow ? 0 : 10,
        },
      ]}
    >
      <ZSPressable onPress={() => onSelect(option)} pressedBackgroundColor="transparent" fullWidth>
        <ViewAtom style={[styles.row, { borderColor: setColor, backgroundColor: innerColor }]}>
          {!isFullWidth && (
            <ViewAtom style={[styles.radioOuter, { borderColor: setColor }]}>
              <ViewAtom style={[styles.radioInner, { backgroundColor: setColor }]} />
            </ViewAtom>
          )}

          <ViewAtom style={styles.label}>
            <ZSText {...valueStyle}>{option.value}</ZSText>
          </ViewAtom>

          {isFullWidth && (
            <ViewAtom style={[styles.selectButton, { backgroundColor: selectColor }]}>
              {isSelected ? (
                <SvgCheck size={18} />
              ) : (
                <ZSText typo="body.5" numberOfLines={1} {...selectStyle}>
                  {selectLabel}
                </ZSText>
              )}
            </ViewAtom>
          )}
        </ViewAtom>
      </ZSPressable>
    </ViewAtom>
  );
});

interface ZSRadioGroupProps extends ViewProps {
  options: RadioOption[];
  value?: RadioOption;
  onSelect: (value: RadioOption) => void;
  containerStyle?: ViewProps;
  valueStyle?: ZSTextProps;
  selectStyle?: ZSTextProps;
  selectLabel?: string;
  disabled?: boolean;
  rowCount?: 1 | 2 | 3;
}

function ZSRadioGroup({
  options,
  value,
  onSelect,
  containerStyle,
  valueStyle,
  disabled = false,
  selectStyle,
  selectLabel = '선택',
  rowCount = 1,
  ...props
}: ZSRadioGroupProps) {
  const { palette } = useTheme();
  const isFullWidth = rowCount === 1;

  const handleSelect = useCallback((option: RadioOption) => {
    if (!disabled) {
      onSelect(option);
    }
  }, [disabled, onSelect]);

  return (
    <ViewAtom
      style={[styles.container, { flexDirection: isFullWidth ? 'column' : 'row', flexWrap: isFullWidth ? 'nowrap' : 'wrap' }]}
      {...containerStyle}
      {...props}
    >
      {options.map((option, index) => {
        const isSelected = value?.index === option.index;
        const setColor = isSelected ? palette.primary.light : palette.background.neutral;

        return (
          <RadioRow
            key={option.index}
            option={option}
            index={index}
            optionCount={options.length}
            rowCount={rowCount}
            isSelected={isSelected}
            isFullWidth={isFullWidth}
            setColor={setColor}
            innerColor={isSelected ? palette.background.layer1 : 'transparent'}
            selectColor={isSelected ? palette.primary.main : palette.background.layer2}
            valueStyle={valueStyle}
            selectStyle={selectStyle}
            selectLabel={selectLabel}
            onSelect={handleSelect}
          />
        );
      })}
    </ViewAtom>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  cell: {},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    paddingLeft: 10,
    paddingRight: 15,
    borderRadius: 100,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  label: {
    flex: 1,
    paddingLeft: 10,
    paddingRight: 12,
    minWidth: 0,
  },
  selectButton: {
    paddingHorizontal: 10,
    borderRadius: 100,
    minWidth: 42,
    minHeight: 24,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
});

export default memo(ZSRadioGroup);
