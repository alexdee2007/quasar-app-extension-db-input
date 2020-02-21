export default (url, fileName) => {

  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);

  if (document.createEvent) {
    var event = document.createEvent('MouseEvents');
    event.initEvent('click', true, true);
    link.dispatchEvent(event);
  } else {
    link.click();
  }

  window.URL.revokeObjectURL(link.href);
  link.remove();

}
