以下是使用 `git filter-branch` 来移除Git历史记录中大文件的教程。这个步骤适用于你已经提交了一些超过GitHub文件大小限制的大文件，并且需要从Git历史记录中彻底删除这些文件。

### Git Filter-Branch 教程：移除大文件

#### 1. 确保位于仓库的顶层目录

在进行任何操作之前，请确保你位于Git仓库的顶层目录。

```bash
cd /path/to/your/repository
```

例如，如果你的仓库位于 `~/cpp_chatsystem` 目录下，请执行以下命令：

```bash
cd ~/cpp_chatsystem
```

#### 2. 使用 `git filter-branch` 移除大文件

运行以下命令来从Git历史记录中移除指定的大文件。

```bash
git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch path/to/largefile1 path/to/largefile2' --prune-empty --tag-name-filter cat -- --all
```

- **path/to/largefile1** 和 **path/to/largefile2** 是你想要移除的大文件的路径。例如：

  ```bash
  git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch Playground/demos/5.brpc/client Playground/demos/5.brpc/server' --prune-empty --tag-name-filter cat -- --all
  ```

这个命令会遍历仓库的所有提交，将指定的大文件从Git的历史记录中移除，并保留其他提交的完整性。

#### 3. 清理本地仓库

在执行 `git filter-branch` 之后，需要清理仓库中的冗余数据，以确保移除的大文件不会保留在Git的垃圾回收中。

```bash
rm -rf .git/refs/original/
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

- `rm -rf .git/refs/original/` 删除备份的原始引用。
- `git reflog expire --expire=now --all` 使Git的引用日志过期。
- `git gc --prune=now --aggressive` 执行垃圾回收，移除所有不再需要的对象。

#### 4. 强制推送更改到远程仓库

由于历史记录被重写，你需要强制推送这些更改到远程仓库。

```bash
git push origin main --force
```

- `origin` 是你的远程仓库名称。
- `main` 是你推送的分支名称。

#### 5. 注意事项

- **备份**：在执行任何可能重写历史记录的操作之前，建议你备份你的仓库。
- **通知团队**：由于历史记录被修改，团队中的其他成员需要重新拉取（`git pull --rebase`）代码，否则会遇到冲突。

### 总结

通过使用 `git filter-branch`，你可以有效地移除提交中的大文件，确保Git历史记录干净整洁，并能够顺利推送到远程仓库。这些步骤可以帮助你在将来遇到类似问题时快速解决。

如果你有任何疑问或需要进一步帮助，随时联系我！