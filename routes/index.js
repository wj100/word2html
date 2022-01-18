const fs = require('fs'); // 引入fs模块
const os = require('os');
const path = require('path');
const { resolve } = require('path');
const router = require('koa-router')();
const mammoth = require('mammoth');
router.get('/', async (ctx, next) => {
  await ctx.render('index', {
    title: '主页',
  });
});
router.get('/doc/*', async (ctx, next) => {
  const filePath = path.join(process.cwd(), ctx.request.url);
  console.log('filePath------------------', filePath);
  const htmlContent = fs.readFileSync(filePath);
  ctx.type = 'html';
  ctx.body = htmlContent;
});
router.get('/editor', async (ctx, next) => {
  await ctx.render('editor', {
    title: '编辑HTML',
  });
});

router.post('/word-to-html', async (ctx, next) => {
  let title = ctx.request.body.title;
  let path = ctx.request.files.file.path;
  if (path) {
    return new Promise(async (resolve, reject) => {
      mammoth
        .convertToHtml({ path })
        .then(async result => {
          ctx.body = { code: 0, title: title, path: path, html: `<div class="container">${result.value}</div>` };
          resolve(true);
        })
        .done();
    });
  } else {
    ctx.body = { code: -1, body: 'path不存在' };
  }
});

router.post('/generate-link', async (ctx, next) => {
  let html = ctx.request.body.html;
  let title = ctx.request.body.title;
  if (html) {
    return new Promise(async (resolve, reject) => {
      let tmp = `
      <!DOCTYPE html>
      <html lang="zh">
        <head>
          <meta charset="UTF-8">
          <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
          <meta name="viewport" content="viewport-fit=cover,initial-scale=1.0,maximum-scale=1.0,minimum-scale=1.0,user-scalable=no,width=device-width">
          <meta name="format-detection" content="telephone=no">
          <meta name="apple-touch-fullscreen" content="YES">
          <meta name="apple-mobile-web-app-capable" content="yes">
          <title>${title}</title>
          <style>
          * {
            margin: 0;
            box-sizing: border-box;
            font-family: SimSun, STSong, Arial, Helvetica, sans-serif;
          }
          .container {
            width: 1000px;
            margin: auto;
            padding: 1vw 0;
            text-align: left;
          }
    
          @media (max-width: 800px) {
            .container {
              width: calc(100% - 40px);
              padding: 20px 15px;
            }
          }
    
          a {
            color: blue;
            text-decoration: none;
          }
          p{
              text-indent: 2em;
              line-height: 2;
          }
        </style>
        </head>
        <body>
          <div class="container">${html}</div>
        </body>
      </html>`;
      fs.writeFile(`./doc/${title}.html`, tmp, function (err) {
        if (err) {
          throw err;
        }
        const url='http://59.111.229.252:8070/doc/' + title + '.html'
        ctx.body = { code: 0, url:url};
        resolve(true);
      });
    });
  } else {
    ctx.body = { code: -1, body: '内容为空' };
  }
});

module.exports = router;
