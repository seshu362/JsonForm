//register
import { 
    RankedTester, 
    rankWith, 
    isStringControl, 
    isEnumControl,
    isNumberControl,
    isIntegerControl,
    isBooleanControl,
    ControlElement 
} from '@jsonforms/core';
import { CustomTextComponent } from '../custom-renderers/custom-text/custom-text.component';

export const customTextControlTester: RankedTester = rankWith(
    10,
    (uischema, schema, context) => 
        isStringControl(uischema, schema, context) && 
        (uischema as ControlElement)?.options?.['custom']
);


export const customRenderers = [
    { tester: customTextControlTester, renderer: CustomTextComponent },
    
];