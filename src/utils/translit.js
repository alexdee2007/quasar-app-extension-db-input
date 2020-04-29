export function translitRuUk(value, dict) {
  let result = value.toUpperCase();

  /* фамилия: послденее "АЯ" -> "А" */
  dict === '-FM' && (result = result.replace(/АЯ$/gu, 'А'));
  /* фамилия: последнее "ЯЯ" -> "Я" */
  dict === '-FM' && (result = result.replace(/ЯЯ$/gu, 'Я'));

  /* отчество: последнее "ЬЕВИЧ|ЕВИЧ" -> "ОВИЧ" */
  dict === '-OT' && (result = result.replace(/(ЬЕВИЧ|ЕВИЧ)$/gu, 'ОВИЧ'));
  /* отчество: последнее "ЬЕВНА|ЕВНА|ОВНА" -> "ІВНА" */
  dict === '-OT' && (result = result.replace(/(ЬЕВНА|ЕВНА|ОВНА)$/gu, 'ІВНА'));

  /* после ЙКНГЗХФВПЛДСМТБ "ЕЕВ" -> "ЄЄВ" */
  result = result.replace(/([ЙКНГЗХФВПЛДСМТБ])ЕЕВ/gu, '$1ЄЄВ');
  /* после ЙКНГЗХФВПЛДСМТБ "ЕВ" -> "ЄВ" */
  result = result.replace(/([ЙКНГЗХФВПЛДСМТБ])ЕВ/gu, '$1ЄВ');
  /* после УЕЫАОЭЯИЮЬЪ "Е" -> "Є" */
  result = result.replace(/([УЕЫАОЭЯИЮЬЪ])Е/gu, '$1Є');
  /* первый "Е" -> "Є" */
  result = result.replace(/^Е/gu, 'Є');

  /* после ЙЦКНГЗХФВПРЛДСМТБ before not КЧЦЩЙ "И" -> "І" */
  result = result.replace(/([ЙЦКНГЗХФВПРЛДСМТБ])И([^КЧЦЩЙ])/gu, '$1І$2');
  /* после УЕЫАОЭЯИЮЬЪ "И" -> "Ї" */
  result = result.replace(/([УЕЫАОЭЯИЮЬЪ])И/gu, '$1Ї');
  /* первый и последний "И" -> "І" */
  result = result.replace(/^И|И$/gu, 'І');

  /* "Э" -> "Е" */
  result = result.replace(/Э/gu, 'Е');
  /* "Ы" -> "И" */
  result = result.replace(/Ы/gu, 'И');
  /* "Ъ" -> "`" */
  result = result.replace(/Ъ/gu, '`');
  /* последний "Ц" -> "ЦЬ" */
  result = result.replace(/Ц$/gu, 'ЦЬ');
  /* первый "Ё" -> "ЙО" */
  result = result.replace(/^Ё/gu, 'ЙО');
  /* не первый "Ё" -> "ЬО" */
  result = result.replace(/(.+)Ё/gu, '$1ЬО');
  /* "СК" -> "СЬК" */
  result = result.replace(/СК/gu, 'СЬК');
  /* "ЦК" -> "ЦЬК" */
  result = result.replace(/ЦК/gu, 'ЦЬК');

  return result;
}

export function translitUkRu(value, dict) {

  let result = value.toUpperCase();

  result = result.replace(/Е/gu, 'Э');
  result = result.replace(/Є/gu, 'Е');
  result = result.replace(/И/gu, 'Ы');
  result = result.replace(/І/gu, 'И');
  result = result.replace(/Ї/gu, 'ЙИ');
  result = result.replace(/(`|')/gu, 'Ъ');
  result = result.replace(/(ЙО|ЬО)/gu, 'Ё');
  result = result.replace(/СЬК/gu, 'СК');
  result = result.replace(/ЦЬК/gu, 'ЦК');
  result = result.replace(/ЦЬ/gu, 'Ц');

  return result;
}
