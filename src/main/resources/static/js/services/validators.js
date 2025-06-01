import { Required, MinLength, MinNumber } from '@lion/form-core';

export class RequiredWithMessage extends Required {
    static async getMessage() {
        return 'This field is required';
    }
}
