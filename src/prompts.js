module.exports = function () {
  return [
    {
      name: 'types',
      type: 'checkbox',
      message: 'Pls select types',
      choices: [
        {
          name: 'text',
          value: 'text',
          checked: true,
          disabled: 'required'
        },
        {
          name: 'select',
          value: 'select',
          checked: true
        },
        {
          name: 'date and datetime',
          value: 'date',
          checked: true
        },
        {
          name: 'autocomplete',
          value: 'autocomplete',
          checked: true
        },
        {
          name: 'model',
          value: 'model',
          checked: true
        },
        {
          name: 'address',
          value: 'address'
        },
        {
          name: 'models',
          value: 'models'
        },
        {
          name: 'upload',
          value: 'upload'
        }
      ]
    }
  ]
}
