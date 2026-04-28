# SPEC - 团队运营手册

> 由 team-spec-setup 自动生成，可按需修改。
> 此文件让 team-lead 的团队知识在上下文压缩后仍然保持。

## Team-Lead 控制平面

- team-lead = 主对话，不是生成的 agent
- team-lead 负责用户对齐、范围控制、任务分解和阶段推进
- team-lead 维护项目全局真相：主 `task_plan.md`、`decisions.md` 和此 `CLAUDE.md`
- team-lead 决定某个流程改进是项目本地的还是需要写回 `CCteam-creator` 的
- **禁用独立子智能体**：团队存在后，所有工作通过 SendMessage 交给队友。不要启动独立的 Agent/子智能体（Explore、general-purpose 等）——它们绕过团队的规划文件和协作体系。唯一例外：用 `team_name` 生成新队友加入团队

## 团队花名册

| 名称 | 角色 | 模型 | 核心能力 |
|------|------|------|---------|
| backend-dev | 后端开发 | sonnet | FastAPI + Playwright + SQLite + 任务队列 |
| frontend-dev | 前端开发 | sonnet | React + TypeScript + React Flow + Tailwind + Zustand |
| researcher | 研究员 | sonnet | Dify 源码分析 + 页面结构识别 + 翻页/等待策略 + 网站适配方案 |
| e2e-tester | 联调测试 | sonnet | Playwright E2E 测试 + 浏览器自动化 + Bug 记录 |
| reviewer | 代码审查 | sonnet | 安全/质量/性能审查（只读） |
| custodian | 管家 | sonnet | 约束合规 + 文档治理 + 模式自动化 + 代码清理 |

## 任务下发协议

### 消息送达时序（关键）
`SendMessage` 只在接收方 idle 时送达——**无法**打断进行中的任务。初始派单必须前置上下文（没有中途追加），广播也没有抢占，实时状态靠直接读 `progress.md` / `findings.md`（**文件实时，消息不是**）。完整指南：SKILL.md § 消息送达时序约束。

### TaskCreate 描述格式（team-lead 上下文压缩后参考）

TaskCreate 描述：一句话范围 + 验收标准 + `.plans/` 路径。
示例：`"JWT 认证模块。输入：researcher 调研在 .plans/x/researcher/research-auth/findings.md。输出：可用的认证 + 测试。详见 .plans/x/backend-dev/task-auth/task_plan.md"`
通过 TaskUpdate 分配负责人和设置依赖。Teammate 可自行通过 TaskList 认领已解锁的任务。

### 大任务（功能开发、新模块）-- 停止检查后再发送

**在给任何智能体下发大任务前，检查消息中是否包含以下 4 项。如有缺失，先补上再发。不要跳过——智能体们靠这些正常工作。**

1. **范围和目标**：要做什么、验收标准
2. **文档提醒**："请创建 `<前缀>-<任务名>/` 任务文件夹（含 task_plan.md + findings.md + progress.md），并在你的根 findings.md 中添加索引条目"
3. **依赖说明**：依赖哪些调研/任务的结论，关键文件路径和行号
4. **审查预期**：完成后是否需要代码审查

示例：
```
SendMessage(to: "backend-dev", message:
  "新任务：实现认证模块。
   范围：JWT 登录 + refresh token + 认证中间件。
   依赖：researcher 的调研结论在 .plans/<project>/researcher/research-auth/findings.md
   请创建 task-auth/ 文件夹，并更新你的根 findings.md 索引。
   这是大功能——完成后请找 reviewer 审查。")
```

各角色的任务文件夹前缀：
- backend-dev / frontend-dev：`task-<名称>/`
- researcher：`research-<主题>/`
- e2e-tester：`test-<范围>/`
- reviewer：`review-<目标>/`

### 小任务（Bug 修复、配置变更）

直接发消息说明改动即可，不需要任务文件夹，也不需要审查。
```
SendMessage(to: "frontend-dev", message: "修复登录表单的 XSS 漏洞，见 src/auth/login.tsx:42")
```

## 通信速查

| 操作 | 命令 |
|------|------|
| 给单个智能体分配任务 | `SendMessage(to: "<名称>", message: "...")` |
| 广播给所有人（慎用） | `SendMessage(to: "*", message: "...")` |
| dev 请求代码审查 | dev 直接联系 reviewer（不经过 team-lead） |

## 状态检查

| 要检查什么 | 怎么做 |
|-----------|--------|
| 全局概览 | `TaskList` — 所有任务、负责人、阻塞情况一览 |
| 快速扫描 | 并行读取各 agent 的 `progress.md` |
| 深入了解 | 读 agent 的 `findings.md`（索引）→ 再看具体任务文件夹 |
| 方向检查 | 读 `.plans/SPEC/task_plan.md` |
| 恢复项目 | 读 `team-snapshot.md` → 检查陈旧度 → 从缓存 prompt 启动智能体 → 读各 agent 的 `findings.md` 索引 → 重建 TaskCreate |

读取顺序：**progress**（到哪了）→ **findings**（遇到什么）→ **task_plan**（目标是什么）

## 文档索引（知识库）

> **导航地图**：`docs/index.md` 有各文档的 section 级导航（含行号范围）。
> custodian 维护 docs/index.md。需要在 docs/ 中查找信息时先 Read 它。
> CLAUDE.md 不是热加载的——动态导航信息放在 docs/index.md 中，不在这里。

| 文档 | 位置 | 维护者 |
|------|------|--------|
| 导航地图 | .plans/SPEC/docs/index.md | custodian（sections、行号、新鲜度） |
| 架构 | .plans/SPEC/docs/architecture.md | team-lead, devs |
| API 契约 | .plans/SPEC/docs/api-contracts.md | devs（API 变更时**必须**同步） |
| 不变量 | .plans/SPEC/docs/invariants.md | team-lead, reviewer |

**Doc-Code Sync 规则**：当代码变更了 API 或架构时，对应的 docs/ 文件**必须**在同一个任务中同步更新。未文档化的 API 对其他智能体来说不存在。

## 自动化检查

> custodian 构建和维护检查脚本。列在这里让 team-lead 知道哪些已自动化。

| 检查 | 脚本 | 执行什么 |
|------|------|---------|
| 黄金原则 | scripts/golden_rules.py | 文件大小、密钥、console.log、文档新鲜度、不变量覆盖 |
| CI（测试 + 类型） | scripts/run_ci.py | 黄金原则 + 所有测试通过 + 类型检查 |
| （custodian 构建检查后在此添加） | | |

## 审查维度

> 项目特定的审查维度。Reviewer 在每次审查时给各维度打分。
> team-lead 在搭建时根据项目目标和用户质量优先级定义这些维度。
> 推荐 3-5 个维度。标准检查（安全/质量/性能/文档同步）总是适用的，维度在此基础上添加项目专属判断。

| # | 维度 | 权重 | STRONG 表现 | WEAK 表现 |
|---|------|------|-----------|---------|
| RD-1 | 产品深度 | 高 | 涵盖真实用户会遇到的边界情况——空状态、错误恢复、并发访问，不只是开心路径 | 仅能在开心路径工作；错误状态显示原始异常或根本没有 |
| RD-2 | 代码可测试性 | 中 | 关键行为被集成测试覆盖；添加新测试很容易 | 没有测试，或测试与实现细节耦合，重构时会断 |
| RD-3 | 文档同步 | 高 | API 变更同步到 api-contracts.md；架构变更同步到 architecture.md | 文档漂移——代码变了文档没变 |

（Phase 1 审查时 reviewer 根据实际情况补充校准案例）

## Harness 检查清单

Team-lead 在阶段边界检查（不是每个任务都查）：

### 运营健康状况（每个阶段边界）

- **文档 harness**：读 CLAUDE.md + 主 task_plan.md——还准确吗？如果过时 → 在下发下一阶段任务前更新
- **可观测性 harness**：Grep progress.md 搜索 "error|fail"——失败记录是否有足够细节（尝试步骤、具体错误、根因）？
- **不变量 harness**：检查下方 Known Pitfalls——是否有条目应提升为 reviewer 检查项或自动化测试断言？
- **回放 harness**：本阶段是否产生了可复用的模式（搜索策略、架构模板、测试方案）？如果有，用 [TEAM-PROTOCOL] 记录供未来参考

### 假设审计（模型升级或项目回顾时）

> 每个 harness 组件都对模型能力局限做了假设。这些假设会过时。当新模型发布、进行项目回顾，或某个机制持续没有价值时，进行审计。

| 组件 | 它编码的假设 | 还需要吗？| 操作 |
|------|-----------|--------|------|
| 任务文件夹 | 没有分解，模型会丧失连贯性 | 检查：智能体有效利用了文件夹吗，还是开销 > 收益？ | 保留 / 简化 / 删除 |
| 3-Strike 协议 | 没有护栏，模型会无限重试 | 检查：本阶段 3-Strike 实际触发了多少次？ | 保留 / 提高阈值 / 删除 |
| 上下文恢复协议 | 压缩后模型无法自然恢复上下文 | 检查：现在的模型能自然捡起文件中的上下文吗？ | 保留 / 简化 / 删除 |
| Sprint/任务粒度 | 模型无法在一次通过中处理大范围 | 检查：任务能否更粗粒度而不影响质量？ | 保持当前 / 改为更粗 |
| Reviewer 评审 | 模型不能自我评估 | 检查：reviewer 发现了 dev 真正遗漏的问题，还是大多数时候就是走过场？ | 保留 / 降低频率 / 删除（仅简单任务） |
| 审查维度评分 | 泛型清单遗漏项目特定质量 | 检查：维度评分是否驱动了有用的反馈，超出了标准检查的范畴？ | 保留 / 调整维度 / 删除 |
| 审查前 CI 门禁 | 没有强制，模型会跳过验证 | 检查：dev 主动运行了 CI，还是只在被迫时才跑？ | 保留 / 信任 dev |
| Doc-Code Sync 规则 | 模型改完代码会忘记更新文档 | 检查：文档漂移还是个问题，还是智能体自然同步了？ | 保留 / 放松 |

**决策规则**：如果某组件在上个阶段触发少于 2 次，且删除它不会导致可观测的质量下降 → 删除或简化的候选。记录决策到 `decisions.md`。

**原则**：有趣的 harness 组合不会随模型改进而缩小——它们会移动。删除不再需要的东西，添加新的机制来处理现在在能力范围内的功能。

## Known Pitfalls

> 当识别到反复出现的失败模式时追加到这里。每个条目都是一次"防火"。
> 格式：症状、根因、修复方法、预防措施。

（初始为空——team-lead 从 3-Strike 解决方案、reviewer [BLOCK] 修复或任何重复失败中添加条目）

## 风格决策

> 项目中捕获的用户品味偏好。
> 当同一模式出现 3+ 次时，custodian 应将其编码到 golden_rules.py 中。
> 格式：决策内容、来源（用户反馈 / 审查 / 事故）、执行状态。

| # | 决策 | 来源 | 状态 |
|---|------|------|------|
| （示例）SD-1 | 变量名使用 camelCase，不用 snake_case | 用户反馈 Session 2 | Manual |

状态值：
- `Manual` — 仅文档记录，reviewer 按惯例检查
- `Pending automation` — 出现 3+ 次，等待 custodian 编码
- `Automated (GR-N)` — 已编码到 golden_rules.py，机械化强制

（删除示例行，在用户提供反馈时填充）

## 核心协议

| 协议 | 触发时机 | 操作 |
|------|---------|------|
| 需求对齐 | 团队搭建后、开发前 | researcher 探索代码库（T0a），再由 team-lead 与用户对齐（T0b）。更新 task_plan.md §1-§2 |
| 计划压力测试 | 架构定稿前 | 委托 researcher："压力测试此计划，走查每个决策分支"。从 findings.md 读取结论 |
| 3-Strike 上报 | 智能体报告 3 次失败 | 读其 progress.md，给新方向或重新分配 |
| 代码审查 | 大功能/新模块完成 | dev 在 findings.md 写改动摘要，发给 reviewer |
| 阶段推进 | 阶段完成 | 调研完：读 findings 更新主计划。开发完：等 reviewer [OK]/[WARN] |
| 上下文溢出 | 智能体报告上下文过长 | 进度已存文件，恢复或生成后继者 |
| CI 门禁 | 任何代码变更（dev 完成任务时） | 运行 CI 脚本，所有检查 PASS 后才能提交审查。CI 失败 = 任务未完成 |
| 护栏捕获 | 3-Strike 上报解决后，或 reviewer [BLOCK] 修复后 | 问：会复现吗？如果会 → 追加到 Known Pitfalls；如果通用 → [TEAM-PROTOCOL] |
| custodian 巡检 | 2-3 个 dev 任务完成后，或阶段边界时 | team-lead 触发 custodian 合规巡检；custodian 报告缺口 |
| 模式→自动化 | reviewer 标记 [AUTOMATE] 时 | team-lead 转给 custodian → 构建检查脚本 → 加入 CI |
| 品味捕获 | 用户对代码风格/命名/结构表达偏好时 | 记录到 CLAUDE.md 风格决策。3+ 次同类 → 标记 `Pending automation`，派 custodian 编码到 golden_rules.py |
| 风格→自动化 | 风格决策达到 `Pending automation` | custodian 编码检查到 golden_rules.py，更新状态为 `Automated (GR-N)`。不可机械化的 → 保持 Manual 并注明原因 |
| 模板同步 | 发现持久流程改进 | 先更新 `CCteam-creator` 源文件，再同步项目文档 |
| 升级判断（dev 角色） | dev 遇到需求不清/范围膨胀/架构影响/不可逆选择 | 必须先问 team-lead，附上 2-3 个选项和倾向 |
| 团队重建时机 | 模板变更足以影响已生成智能体行为 | 优先在阶段边界重建，不要在开发中途 |

### 任务下发：最小化信息损耗

智能体间的消息会丢失细节。每次任务下发必须自包含：
- 引用 findings/文档的文件路径（让智能体读文件，而不是读你的摘要）
- 消息中包含验收标准（让智能体知道何时算完成）
- 标注 [AFK] 或 [HITL]，让智能体知道是否可以自主推进

### 模板级 vs 项目本地变更

按以下标准区分：

- **项目本地**：只有当前项目的文档或流程需要变更
- **模板级**：未来团队应继承该变更，需先更新 `CCteam-creator`

典型的模板级变更：

- team-lead 职责
- 角色边界
- 入职协议
- CLAUDE.md 结构
- 任务/发现/进度约定
- 重建时机规则

## 文件结构

```
.plans/SPEC/
  task_plan.md          -- 主计划：精简导航图（team-lead 维护）
  team-snapshot.md      -- 缓存的入职 prompts（快速恢复用，见模板下方）
  findings.md           -- 团队级发现
  progress.md           -- 工作日志
  decisions.md          -- 架构决策记录
  docs/                 -- 项目知识库（架构、API 等的真理源头）
    index.md            -- 导航地图：sections 和行号范围（custodian 维护）
    architecture.md     -- 系统架构、组件、数据流
    api-contracts.md    -- 前后端 API 定义、字段规范、状态机
    invariants.md       -- 系统不变量（不可违反的边界）
  archive/              -- 归档历史（不删除，但不需要每天读取）
  backend-dev/         -- 后端开发
  frontend-dev/        -- 前端开发
  researcher/          -- 研究员
  e2e-tester/          -- 联调测试
  reviewer/            -- 代码审查
  custodian/           -- 管家
    <前缀>-<任务>/      -- 任务文件夹（每个分配的任务一个）
```
