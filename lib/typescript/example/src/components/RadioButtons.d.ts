import React from 'react';
import { type PressableProps } from 'react-native';
interface RadioButtonData {
    label: string;
    value: string;
}
interface RadioButtonProps extends PressableProps {
    title: string;
    handleTriggerType: Function;
    value: string;
    data: RadioButtonData[];
}
declare const RadioButtons: React.FC<RadioButtonProps>;
export default RadioButtons;
//# sourceMappingURL=RadioButtons.d.ts.map