import { get, mapValues } from 'lodash';
import { singularize } from 'inflection';
import models from 'src/models';

import DbInputText from './DbInputText';
import DbInputDate from './DbInputDate';
import DbInputSelect from './DbInputSelect';
import DbInputAutocomplete from './DbInputAutocomplete';
import DbInputAddress from './DbInputAddress';
import DbInputExtended from './DbInputExtended';
//import DbInputPersPhoto from './inputs/DbInputPersPhoto';
//import DbInputUpload from './components/inputs/DbInputUpload';
//import DbInputList from './components/inputs/DbInputList';

const getFieldName = (fieldPath) => {  //tomixins
  const match = fieldPath.match(/(.*)\[(\d*)\]\.([0-9A-Za-z]+)$/);
  if (match) {
    const modelName = singularize(match[1].split('.').pop());
    return `${modelName}.${match[3]}`;
  }
  return fieldPath.split('.').slice(-2).join('.');
}

export default {
  functional: true,
  render(createElement, context) {

    const fieldPath = context.data.model.expression;
    const fieldName = getFieldName(fieldPath);
    const field = get(mapValues(models, 'fields'), fieldName, {});
    const validatePath = context.props.validatePath || fieldPath.replace(/\[(\d*)\]/g, '.$each.$1');
    const type = context.props.type || field.type || 'text';
    const label = context.props.label || field.label;
    const dict = context.props.dict || field.dict;
    const pref = context.props.pref || field.pref;
    const language = context.props.language || field.language;
    const description = context.props.description || field.description;

    // bool
    const upperCase = context.props.upperCase === undefined ? field.upperCase : context.props.upperCase;
    const multiple = context.props.multiple === undefined ? field.multiple : context.props.multiple;
    const cascade = context.props.cascade === undefined ? field.cascade : context.props.cascade;
    const remote = context.props.remote === undefined ? field.remote : context.props.remote;

    Object.assign(context.data.attrs, {type, multiple, label, upperCase, cascade, dict, remote, fieldPath, fieldName, validatePath, description, pref, language});

    switch (type) {
      case 'select':
        return createElement(DbInputSelect, context.data, context.children);
      case 'autocomplete':
        return createElement(DbInputAutocomplete, context.data, context.children);
      case 'address':
        return createElement(DbInputAddress, context.data, context.children);
      case 'date':
      case 'datetime':
        return createElement(DbInputDate, context.data, context.children);
      case 'extended':
        return createElement(DbInputExtended, context.data, context.children);
//            case 'upload':
//                return createElement(DbInputUpload, context.data, context.children);
//            case 'pers-photo':
//                return createElement(DbInputPersPhoto, context.data, context.children);
//            case 'list':
//                return createElement(DbInputList, context.data, context.children);
      default:
        return createElement(DbInputText, context.data, context.children);
    }
  }
}
