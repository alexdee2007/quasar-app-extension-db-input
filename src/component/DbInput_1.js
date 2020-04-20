import Vue from 'vue';
import { get, findLastIndex } from 'lodash';

export default {
  //functional: true,
  render(createElement, context) {

    const fieldPath = context.data.model.expression;

    console.log(fieldPath);

    const splittedPath = fieldPath.split('.');
    const modelIndex = findLastIndex(splittedPath.slice(0, -1), (v, i, o) => get(context.parent, o.slice(0, i + 1).join('.')) instanceof Vue);
    const model = get(context.parent, splittedPath.slice(0, modelIndex + 1).join('.'));

    const fieldName = splittedPath.slice(modelIndex + 1).join('.');
    const field = model ? model.$getField(fieldName) : {};

    const validate = context.props.validation ? context.props.validation : model ? get(model.$validate, fieldName) : {};

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

    Object.assign(context.data.attrs, {type, multiple, label, upperCase, cascade, dict, remote, fieldPath, fieldName, description, pref, language, validate});

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
      case 'list':
        return createElement('db-input-list', context.data, context.children);
      default:
        return createElement('db-input-text', context.data, context.children);
    }
  }
}
