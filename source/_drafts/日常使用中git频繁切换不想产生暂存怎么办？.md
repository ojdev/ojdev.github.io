---
abbrlink: git暂存
categories:
- - 软件开发
date: '2026-08-05T17:18:29.027942+08:00'
tags:
- git
- 暂存
- 切换分支
title: 告别频繁切换：使用 Git Worktree 实现多分支并行开发
updated: '2026-08-05T17:18:29.969+08:00'
---
在日常开发流程中，我们经常会遇到这样的场景：`feature_100 `分支已经进入验收阶段，而 `feature_101 `分支的开发任务也已同步启动。在等待 `feature_100 `验收的过程中，开发者通常需要切换到 `feature_101` 继续编码。如果此时 `feature_100 `验收中发现了 Bug 需要紧急修复，开发者又不得不暂存（Stash）当前 `feature_101 `的代码，再切回 `feature_100 `进行修复。

这种频繁的分支切换和代码暂存，不仅严重打断开发心流，还极易导致代码丢失、提交记录混乱或合并冲突等问题。为了解决这一痛点，我们可以引入 `git worktree` 工具，实现多分支、多目录的并行开发。

# 核心原则

一般情况下，我们采用 `develop `作为基础开发分支。所有的功能分支都应从 `develop `分支拉取最新代码进行开发，以确保基线的一致性。

## 创建独立工作树（Worktree）

假设我们的主仓库存放在 `D:\Work\Repos\Core.Service_Develop`。当我们需要同时开发 `feature_100 `和 `feature_101 `时，无需在主仓库中反复切换，而是为它们创建独立的工作目录：

**创建 feature\_100 工作树：**

```bash
# 在主仓库目录下执行
D:\Work\Repos\Core.Service_Develop> git worktree add -b feature-100 ../Core.Service_100 develop
```

执行后，系统会基于 `develop `创建 `feature-100` 分支，并在 `D:\Work\Repos\Core.Service_100` 目录下生成完整的工作树。

**创建 feature\_101 工作树：**

```bash
D:\Work\Repos\Core.Service_Develop> git worktree add -b feature-101 ../Core.Service_101 develop
```

同理，生成 `D:\Work\Repos\Core.Service_101` 目录。此时，两个分支拥有完全独立的文件系统，互不干扰，你可以同时打开两个 IDE 窗口进行并行开发。

## 清理已归档的工作树

**当某个分支（如** `feature_100`）完成开发、合并并归档后，可以安全地移除其对应的工作树目录：

```bash
D:\Work\Repos\Core.Service_Develop> git worktree remove ../Core.Service_100 -f
```

**注意：** 此操作仅删除 `Core.Service_100` 这个物理目录，**不会删除 `feature-100` 分支本身**。分支记录依然保留在主仓库中，随时可以通过 `git branch` 查看或重新创建 `worktree`。

## 同步最新代码与合并规范

在多分支并行开发时，保持代码同步尤为重要。如果 `feature_101 `需要合并 `develop `的最新代码，推荐以下操作路径：

**切换到主仓库目录，拉取最新代码：**

```bash
D:\Work\Repos\Core.Service_Develop> git checkout develop
D:\Work\Repos\Core.Service_Develop> git pull
```

**切换到** `feature_101` **的工作树目录，执行合并：**

```bash
D:\Work\Repos\Core.Service_101> git merge develop
```

**最佳实践建议：** 强烈建议在分支提交（Push）或发起合并请求（MR/PR）前，都在本地先执行一次` merge develop`。提前在本地解决潜在的冲突，可以有效防止远程分支合并时的混乱，保障主干分支的健康。

## 补充注意事项

* **同一分支不可复用：** Git 不允许两个 worktree 同时检出（checkout）同一个分支。这是为了防止多目录下的文件状态发生冲突。
* **共享底层数据：** 所有的 worktree 都共享同一个 `.git` 仓库数据（如提交历史、对象库等），因此不会占用双倍磁盘空间，且在一个 worktree 中的 commit，在其他 worktree 中是立即可见的。
* **查看当前工作树：** 随时可以使用 `git worktree list` 命令来查看当前所有的分支及其对应的本地路径，方便管理。
