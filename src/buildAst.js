import _ from 'lodash';

const getUniqKeys = (obj1, obj2) => [...Object.keys(obj1), ...Object.keys(obj2)]
  .filter((value, index, array) => array.indexOf(value) === index);

const getAST = (beforeObject, afterObject) => {
  const keys = getUniqKeys(beforeObject, afterObject);

  const propertyActions = [
    {
      check: (key) => _.has(afterObject, key) && !_.has(beforeObject, key),
      action: (key) => ({ state: 'added', key, value: afterObject[key] }),
    },
    {
      check: (key) => _.has(beforeObject, key) && !_.has(afterObject, key),
      action: (key) => ({ state: 'deleted', key, value: beforeObject[key] }),
    },
    {
      check: (key) => (_.isObject(beforeObject[key]) && _.isObject(afterObject[key])),
      action: (key) => ({ state: 'hasChildren', key, children: getAST(beforeObject[key], afterObject[key]) }),
    },
    {
      check: (key) => beforeObject[key] !== afterObject[key],
      action: (key) => ({
        state: 'changed', key, value: beforeObject[key], newValue: afterObject[key],
      }),
    },
    {
      check: (key) => beforeObject[key] === afterObject[key],
      action: (key) => ({ state: 'unchanged', key, value: beforeObject[key] }),
    },
  ];

  const getPropertyActions = (key) => propertyActions.find((item) => item.check(key));

  return keys.map((key) => getPropertyActions(key).action(key));
};

export default getAST;
