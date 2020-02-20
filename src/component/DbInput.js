import { get, mapValues } from 'lodash';
import { singularize } from 'inflection';
import models from 'src/models';

const getFieldName = (fieldPath) => {
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
        return createElement('db-input-select', context.data, context.children);
      case 'autocomplete':
        return createElement('db-input-autocomplete', context.data, context.children);
      case 'address':
        return createElement('db-input-address', context.data, context.children);
      case 'date':
      case 'datetime':
        return createElement('db-input-date', context.data, context.children);
      case 'extended':
        return createElement('db-input-extended', context.data, context.children);
      case 'upload':
        return createElement('db-input-upload', context.data, context.children);
      case 'pers-photo':
        return createElement('db-input-pers-photo', context.data, context.children);
      case 'list':
        return createElement('db-input-list', context.data, context.children);
      default:
        return createElement('db-input-text', context.data, context.children);
    }
  }
}
