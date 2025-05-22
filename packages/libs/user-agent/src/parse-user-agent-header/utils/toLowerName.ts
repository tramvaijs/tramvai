import propOr from '@tinkoff/utils/object/propOr';
import compose from '@tinkoff/utils/function/compose';
import toLower from '@tinkoff/utils/string/toLower';

/*
    Function toLowerName returns the name property of an object in lowercase or an empty string if name is not present.
    
    toLowerName(anyObj) 
    equivalent to 
    (anyObj.name || '')?.toLowerCase()
*/
export const toLowerName = compose(toLower, propOr('name', ''));
