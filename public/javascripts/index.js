$(document).ready(function() {
  var uploading = false;
  $('#submit').on('click', function() {
      if(! $('#file').prop('files')[0]) {
          alert('文件呢？？？')
          return
      }
    if (uploading) {
      alert('文件正在上传中，请稍候');
      return false;
    }
    var file = new FormData();
    file.append('title', $('#title').val());
    file.append('file', $('#file').prop('files')[0]);
    console.log('FormData对象实例', file);
    $.ajax({
      url: '/word-to-html',
      type: 'POST',
      cache: false,
      data: file,
      processData: false,
      contentType: false,
      beforeSend: function() {
        uploading = true;
      },
      success: function(data) {
        if (data.code == 0) {
          sessionStorage.setItem('html', data.html);
          sessionStorage.setItem('title', data.title);
          window.location.href = '/editor';
        } else {
          alert('转换失败' + (data.msg ? '，' + data.msg : ''));
        }
        uploading = false;
      },
      error: function(error) {
        console.warn(error);
        alert('转换失败');
      }
    });
  });
});
