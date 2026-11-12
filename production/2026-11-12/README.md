# PISCO · 14 镜 r2 静态制作交接

从 [PC-HANDOFF.md](PC-HANDOFF.md) 开始，在本地 HTTP 服务中打开 [review.html](review.html)。

- `keyframes-r2/`：14 张当前静态候选。文件齐全不等于严格分镜通过或用户批准。
- `references/`：6 张线上原画，只用于锁角色/服装/摄影基准；含旧触碰姿态，不直接作合格视频首帧。
- `brand/pisco-r5.svg`：原始最新 Logo，保留原字形路径。
- `video-input-plan-r2.json`：下一步视频制作计划；当前没有新的生成授权。
- `keyframes/`、`archive/source-storyboard/`：历史素材，只供追溯。
- `audit/rejected-opening-pilot.mp4`：被拒收的单首帧开门试片，只供比较，禁止作成片或当前输入。

运行 `py integrity.py` 校验文件。运行 `py build_review.py` 重建审阅HTML；均仅需Python标准库，兼容Windows/macOS/Linux。

## 已知待决差异

07窗外机车已补齐，头盔沿用原小木桌而非玄关；08雨夜/车库仅出现于面罩。06用假面正面眼孔代替原表的内侧反射。详见 `stagingVariations`。候选图保留供审阅，原分镜文字未据此改写。

本目录不包含新完成的七段叙事视频，不代表发布/合并状态。
