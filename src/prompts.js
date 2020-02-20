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
          name: 'extended',
          value: 'extended',
          checked: true
        },
        {
          name: 'address',
          value: 'address'
        },
        {
          name: 'list',
          value: 'list'
        },
        {
          name: 'upload',
          value: 'upload'
        }
      ]
    }
  ]
}
