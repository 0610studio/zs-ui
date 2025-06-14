import React, { useCallback, memo } from 'react';
import { ViewProps } from 'react-native';
import { RadioOption } from '../types';
import ViewAtom from '../atoms/ViewAtom';
import ZSText, { ZSTextProps } from '../ZSText';
import ZSPressable from '../ZSPressable';
import { useTheme } from '../../model/useThemeProvider';
import { SvgCheck } from '../../assets/SvgCheck';

function ZSRadioGroup({
  options,
  value,
  onSelect,
  containerStyle,
  valueStyle,
  disabled = false,
  fullWidth = false,
  selectStyle,
  rowCount,
}: {
  options: RadioOption[];
  value?: RadioOption;
  onSelect: (value: RadioOption) => void;
  containerStyle?: ViewProps;
  valueStyle?: ZSTextProps;
  selectStyle?: ZSTextProps;
  disabled?: boolean;
  fullWidth?: boolean;
  rowCount?: 2 | 3;
}) {
  const { palette } = useTheme();

  const handleSelect = useCallback((option: RadioOption) => {
    if (!disabled) {
      onSelect(option);
    }
  }, [disabled, onSelect]);

  return (
    <ViewAtom
      style={{
        flexDirection: fullWidth ? 'column' : 'row',
        flexWrap: fullWidth ? 'nowrap' : 'wrap',
        width: '100%',
        marginHorizontal: fullWidth ? 0 : -5,
      }}
      {...containerStyle}
    >
      {options.map((option, index) => {
        const isSelected = value?.index === option.index;
        const setColor = isSelected ? palette.primary.light : palette.background.neutral;

        return (
          <ViewAtom key={option.index} style={{ 
            width: rowCount === 2 
              ? '50%' 
              : rowCount === 3 
                ? '33.33%' 
                : '100%',
            paddingHorizontal: 5,
            paddingBottom: index === options.length - 1 ? 0 : 10,
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
                  borderRadius: 26,
                  borderColor: setColor,
                  backgroundColor: isSelected ? palette.background.layer1 : 'transparent',
                }}
              >
                {/* fullWidth가 false일 때 동그라미 체크박스 표시 */}
                {!fullWidth && (
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
                <ZSText style={{ paddingHorizontal: 10 }} {...valueStyle}>
                  {option.value}
                </ZSText>

                {/* fullWidth가 true일 때 우측에 선택 버튼 표시 */}
                {fullWidth && (
                  <ViewAtom style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end' }}>
                    <ViewAtom
                      style={{
                        backgroundColor: isSelected
                          ? palette.primary.main
                          : palette.background.layer2,
                        paddingHorizontal: 10,
                        borderRadius: 50,
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
