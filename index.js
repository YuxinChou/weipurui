const Koa = require("koa");
const Router = require("koa-router");
const logger = require("koa-logger");
const bodyParser = require("koa-bodyparser");
const fs = require("fs");
const path = require("path");
const { init: initDB, Counter } = require("./db");

const router = new Router();

const homePage = fs.readFileSync(path.join(__dirname, "index.html"), "utf-8");

// 首页
router.get("/", async (ctx) => {
  const { request } = ctx;
  const { echostr } = request.query;
  ctx.body = echostr;
});

router.post("/", async (ctx) => {
  const { request } = ctx;
  console.log('################');
  console.log('request');
  console.log(request);
  console.log('query');
  console.log(request.query);
  console.log('body');
  console.log(request.body);
  try {
    ctx.body = {
      ToUserName: request.body.FromUserName,
      FromUserName: request.body.ToUserName,
      CreateTime: Date.parse(new Date())/1000,
      MsgType: 'text',
      Content: 'Hello!'
    }
  } catch(err) {
    console.log('====== err =========')
    console.log(err)
  }
});

router.get("/home", async (ctx) => {
  ctx.body = homePage;
});

// 更新计数
router.post("/api/count", async (ctx) => {
  const { request } = ctx;
  const { action } = request.body;
  if (action === "inc") {
    await Counter.create();
  } else if (action === "clear") {
    await Counter.destroy({
      truncate: true,
    });
  }

  ctx.body = {
    code: 0,
    data: await Counter.count(),
  };
});

// 获取计数
router.get("/api/count", async (ctx) => {
  const result = await Counter.count();

  ctx.body = {
    code: 0,
    data: result,
  };
});

// 小程序调用，获取微信 Open ID
router.get("/api/wx_openid", async (ctx) => {
  if (ctx.request.headers["x-wx-source"]) {
    ctx.body = req.headers["x-wx-openid"];
  }
});

const app = new Koa();
app
  .use(logger())
  .use(bodyParser())
  .use(router.routes())
  .use(router.allowedMethods());

const port = process.env.PORT || 80;
async function bootstrap() {
  await initDB();
  app.listen(port, () => {
    console.log("启动成功", port);
  });
}
bootstrap();
