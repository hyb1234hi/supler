interface RenderAnyValueField {
  (fieldData: FieldData, options: any, compact: boolean): string
}

interface RenderPossibleValuesField {
  (fieldData: FieldData, possibleValues: SelectValue[], options: any, compact: boolean): string
}

interface RenderOptions {
  // main field rendering entry points
  // basic types
  renderStringField: RenderAnyValueField
  renderIntegerField: RenderAnyValueField
  renderDoubleField: RenderAnyValueField
  renderPasswordField: RenderAnyValueField
  renderTextareaField: RenderAnyValueField
  renderMultiChoiceCheckboxField: RenderPossibleValuesField
  renderMultiChoiceSelectField: RenderPossibleValuesField
  renderSingleChoiceRadioField: RenderPossibleValuesField
  renderSingleChoiceSelectField: RenderPossibleValuesField
  renderActionField: (fieldData: FieldData, options:any, compact:boolean) => string

  // templates
  // [label] [input] [validation]
  renderField: (input: string, fieldData: FieldData, compact: boolean) => string
  renderLabel: (forId: string, label :string) => string
  renderValidation: (validationId: string) => string

  renderStaticField: (label:string, id:string, validationId:string, value:any, compact:boolean) => string
  renderStaticText: (text:string) => string

  renderSubformDecoration: (subform:string, label:string, id:string, name:string) => string
  renderSubformListElement: (subformElement:string, options:any) => string;
  renderSubformTable: (tableHeaders:string[], cells:string[][], elementOptions:any) => string;

  // html form elements
  renderHtmlInput: (inputType: string, fieldData: FieldData, options: any) => string
  renderHtmlSelect: (fieldData: FieldData, possibleValues:SelectValue[], options:any) => string
  renderHtmlRadios: (fieldData: FieldData, possibleValues:SelectValue[], options:any) => string
  renderHtmlCheckboxes: (fieldData: FieldData, possibleValues:SelectValue[], options:any) => string
  renderHtmlTextarea: (fieldData: FieldData, options:any) => string
  renderButton: (fieldData: FieldData, options:any) => string

  // misc
  defaultFieldOptions: () => any
  defaultHtmlInputOptions: (inputType:string, id:string, name:string, value:any, options:any) => any
  defaultHtmlTextareaOptions: (id:string, name:string, options:any) => any
}

class DefaultRenderOptions implements RenderOptions {
  constructor() {
  }

  renderStringField(fieldData, options, compact) {
    return this.renderField(this.renderHtmlInput('text', fieldData, options), fieldData, compact);
  }

  renderIntegerField(fieldData, options, compact) {
    return this.renderField(this.renderHtmlInput('number', fieldData, options), fieldData, compact);
  }

  renderDoubleField(fieldData, options, compact) {
    return this.renderField(this.renderHtmlInput('number', fieldData, options), fieldData, compact);
  }

  // text field render hints
  renderPasswordField(fieldData, options, compact) {
    return this.renderField(this.renderHtmlInput('password', fieldData, options), fieldData, compact);
  }

  renderTextareaField(fieldData, options, compact) {
    return this.renderField(this.renderHtmlTextarea(fieldData, options), fieldData, compact);
  }

  renderStaticField(fieldData, compact) {
    return this.renderField(this.renderStaticText(fieldData.value), fieldData, compact);
  }

  renderStaticText(text) {
    return HtmlUtil.renderTag('div', {'class': 'form-control-static'}, text);
  }

  renderMultiChoiceCheckboxField(fieldData, possibleValues, options, compact) {
    return this.renderField(this.renderHtmlCheckboxes(fieldData, possibleValues, options), fieldData, compact);
  }

  renderMultiChoiceSelectField(fieldData, possibleValues, options, compact) {
    return '';
  }

  renderSingleChoiceRadioField(fieldData, possibleValues, options, compact) {
    return this.renderField(this.renderHtmlRadios(fieldData, possibleValues, options), fieldData, compact);
  }

  renderSingleChoiceSelectField(fieldData, possibleValues, options, compact) {
    return this.renderField(this.renderHtmlSelect(fieldData, possibleValues, options), fieldData, compact);
  }

  renderActionField(fieldData, options, compact) {
    var fieldDataNoLabel = Util.copyObject(fieldData);
    fieldDataNoLabel.label = '';
    return this.renderField(this.renderButton(fieldData, options), fieldDataNoLabel, compact);
  }

  //

  renderField(input, fieldData: FieldData, compact) {
    var labelPart;
    if (compact) {
      labelPart = '';
    } else {
      labelPart = this.renderLabel(fieldData.id, fieldData.label) + '\n';
    }

    var divBody = labelPart +
      input +
      '\n' +
      this.renderValidation(fieldData.validationId) +
      '\n';

    return HtmlUtil.renderTag('div', {'class': 'form-group'}, divBody, false);
  }

  renderLabel(forId, label) {
    return HtmlUtil.renderTag('label', {'for': forId}, label);
  }

  renderValidation(validationId) {
    return HtmlUtil.renderTag('div', {'class': 'text-danger', 'id': validationId});
  }

  renderSubformDecoration(subform, label, id, name) {
    var fieldsetBody = '\n';
    fieldsetBody += HtmlUtil.renderTag('legend', {}, label);
    fieldsetBody += subform;

    return HtmlUtil.renderTag('fieldset', { 'id': id }, fieldsetBody, false);
  }

  renderSubformListElement(subformElement, options) {
    var optionsWithClass = Util.copyProperties({'class': 'well'}, options);
    return HtmlUtil.renderTag('div', optionsWithClass, subformElement, false);
  }

  renderSubformTable(tableHeaders, cells, elementOptions) {
    var tableBody = this.renderSubformTableHeader(tableHeaders);
    tableBody += this.renderSubformTableBody(cells, elementOptions);

    return HtmlUtil.renderTag('table', {'class': 'table'}, tableBody, false);
  }

  private renderSubformTableHeader(tableHeaders) {
    var trBody = '';
    tableHeaders.forEach((header) => trBody += HtmlUtil.renderTag('th', {}, header));

    return HtmlUtil.renderTag('tr', {}, trBody, false);
  }

  private renderSubformTableBody(cells, elementOptions) {
    var html = '';
    for (var i = 0; i < cells.length; i++) {
      var row = cells[i];

      var trBody = '';
      for (var j = 0; j < row.length; j++) {
        trBody += HtmlUtil.renderTag('td', {}, row[j], false);
      }

      html += HtmlUtil.renderTag('tr', elementOptions, trBody, false) + '\n';
    }
    return html;
  }

  //

  renderHtmlInput(inputType, fieldData: FieldData, options) {
    return HtmlUtil.renderTag('input', this.defaultHtmlInputOptions(inputType, fieldData.id, fieldData.name, fieldData.value, options));
  }

  renderHtmlSelect(fieldData: FieldData, possibleValues, options) {
    var selectBody = '';
    Util.foreach(possibleValues, (i, v) => {
      var optionOptions = {'value': v.index};
      if (v.index === fieldData.value) {
        optionOptions['selected'] = 'selected';
      }

      selectBody += HtmlUtil.renderTag('option', optionOptions, v.label);
    });

    var html = HtmlUtil.renderTag('select', Util.copyProperties({'id': fieldData.id, 'name': fieldData.name}, options), selectBody, false);
    html += '\n';
    return html;
  }

  renderHtmlRadios(fieldData: FieldData, possibleValues, options) {
    return this.renderCheckable('radio', fieldData, possibleValues, options,
      (v) => {
        return v.index === fieldData.value;
      });
  }

  renderHtmlCheckboxes(fieldData: FieldData, possibleValues, options) {
    return this.renderCheckable('checkbox', fieldData, possibleValues, options,
      (v) => {
        return fieldData.value.indexOf(v.index) >= 0;
      });
  }

  renderHtmlTextarea(fieldData: FieldData, options) {
    return HtmlUtil.renderTag('textarea', this.defaultHtmlTextareaOptions(fieldData.id, fieldData.name, options), fieldData.value);
  }

  renderButton(fieldData: FieldData, options) {
    var allOptions = Util.copyProperties({'id': fieldData.id, 'type': 'button', 'name': fieldData.name}, options);
    allOptions['class'] = allOptions['class'].replace('form-control', 'btn btn-default');
    return HtmlUtil.renderTag('button', allOptions, fieldData.label);
  }

  private renderCheckable(inputType: string, fieldData: FieldData, possibleValues: SelectValue[], options: any,
    isChecked: (SelectValue) => boolean) {

    var html = '';
    Util.foreach(possibleValues, (i, v) => {
      var checkableOptions = Util.copyProperties({}, options);

      // for checkables we need to remove the form-control default class or they look ugly
      checkableOptions['class'] = checkableOptions['class'].replace('form-control', '');

      if (isChecked(v)) {
        checkableOptions['checked'] = 'checked';
      }

      var checkableFieldData = Util.copyObject(fieldData);
      checkableFieldData.id = fieldData.id + '.' + v.index;
      checkableFieldData.value = v.index;
      var labelBody = this.renderHtmlInput(inputType, checkableFieldData, checkableOptions);
      labelBody += HtmlUtil.renderTag('span', {}, v.label);

      var divBody = HtmlUtil.renderTag('label', {}, labelBody, false);
      html += HtmlUtil.renderTag('div', {'class': inputType}, divBody, false);
    });

    return this.renderWithContainingElement(html, fieldData.id, options);
  }

  private renderWithContainingElement(body:string, id:string, options:any):string {
    // radio buttons and checkboxes need to be grouped inside an element with the form field's id and validation
    // id, so that it could be found e.g. during validation.
    var containerOptions = {
      'id': id,
      'supler:validationId': options[SuplerAttributes.VALIDATION_ID],
      'supler:path': options[SuplerAttributes.PATH]
    };
    return HtmlUtil.renderTag('span', containerOptions, body, false);
  }

  //

  defaultFieldOptions() {
    return {'class': 'form-control'};
  }

  defaultHtmlInputOptions(inputType, id, name, value, options) {
    return Util.copyProperties({'id': id, 'type': inputType, 'name': name, 'value': value}, options);
  }

  defaultHtmlTextareaOptions(id, name, options) {
    return Util.copyProperties({'id': id, 'name': name}, options);
  }
}
