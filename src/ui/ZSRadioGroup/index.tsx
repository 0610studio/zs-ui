import React, { useCallback, memo } from 'react';
import { ViewProps } from 'react-native';
import { RadioOption } from '../types';
import ViewAtom from '../atoms/ViewAtom';
import ZSText, { ZSTextProps } from '../ZSText';
import ZSPressable from '../ZSPressable';
import { useTheme } from '../../context/ThemeContext';
import { SvgCheck } from '../../assets/SvgCheck';

function ZSRadioGroup({
  options,
  value,
  onSelect,
  containerStyle,
  valueStyle,
  disabled = false,
  selectStyle,
  rowCount = 1,
}: {
  options: RadioOption[];
  value?: RadioOption;
  onSelect: (value: RadioOption) => void;
  containerStyle?: ViewProps;
  valueStyle?: ZSTextProps;
  selectStyle?: ZSTextProps;
  disabled?: boolean;
  rowCount?: 1 | 2 | 3;
}) {
  const { palette } = useTheme();
  const isFullWidth = rowCount === 1;

  const handleSelect = useCallback((option: RadioOption) => {
    if (!disabled) {
      onSelect(option);
    }
  }, [disabled, onSelect]);

  return (
    <ViewAtom
      style={{
        flexDirection: isFullWidth ? 'column' : 'row',
        flexWrap: isFullWidth ? 'nowrap' : 'wrap',
        width: '100%',
      }}
      {...containerStyle}
    >
      {options.map((option, index) => {
        const isSelected = value?.index === option.index;
        const setColor = isSelected ? palette.primary.light : palette.background.neutral;

        const colCount = rowCount;
        const isLastCol = (index + 1) % colCount === 0;
        const isLastRow = Math.ceil((index + 1) / colCount) === Math.ceil(options.length / colCount);

        return (
          <ViewAtom key={option.index} style={{
            width: rowCount === 2
              ? '50%'
              : rowCount === 3
                ? '33.33%'
                : '100%',
            paddingRight: isFullWidth ? 0 : isLastCol ? 0 : 3,
            paddingLeft: isFullWidth ? 0 : isLastCol ? 3 : 0,
            paddingBottom: isLastRow ? 0 : 10,
          }}>
            <ZSPressable
              onPress={() => handleSelect(option)}
              pressedBackgroundColor="transparent"
              fullWidth
            >
              <ViewAtom
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 12,
                  borderWidth: 1,
                  paddingLeft: 10,
                  paddingRight: 15,
                  borderRadius: 100,
                  borderColor: setColor,
                  backgroundColor: isSelected ? palette.background.layer1 : 'transparent',
                }}
              >
                {/* fullWidth가 false일 때 동그라미 체크박스 표시 */}
                {!(isFullWidth) && (
                  <ViewAtom
                    style={{
                      width: 20,
                      height: 20,
                      borderWidth: 1,
                      borderRadius: 10,
                      borderColor: setColor,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <ViewAtom
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: 6,
                        backgroundColor: setColor,
                      }}
                    />
                  </ViewAtom>
                )}
                {/* 옵션 텍스트 표시 */}
                <ZSText style={{ paddingLeft: 10, paddingRight: 12 }} {...valueStyle}>
                  {option.value}
                </ZSText>

                {/* fullWidth가 true일 때 우측에 선택 버튼 표시 */}
                {isFullWidth && (
                  <ViewAtom style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end' }}>
                    <ViewAtom
                      style={{
                        backgroundColor: isSelected
                          ? palette.primary.main
                          : palette.background.layer2,
                        paddingHorizontal: 10,
                        borderRadius: 100,
                        minWidth: 42,
                        minHeight: 24,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      {isSelected ? (
                        <SvgCheck size={18} />
                      ) : (
                        <ZSText typo="body.5" {...selectStyle}>
                          선택
                        </ZSText>
                      )}
                    </ViewAtom>
                  </ViewAtom>
                )}
              </ViewAtom>
            </ZSPressable>
          </ViewAtom>
        );
      })}
    </ViewAtom>
  );
}

export default memo(ZSRadioGroup);
