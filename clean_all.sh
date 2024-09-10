#!/bin/bash

# 递归遍历目录
function clean_in_dir() {
  local dir="$1"

  # 进入目录
  echo "进入目录: $dir"
  cd "$dir" || return

  # 如果找到 Makefile，执行 make clean
  if [ -f "Makefile" ]; then
    echo "执行 make clean in $dir"
    make clean
  fi

  # 递归地遍历子目录
  for subdir in */ ; do
    if [ -d "$subdir" ]; then
      clean_in_dir "$subdir"
    fi
  done

  # 回到上一级目录
  cd ..
}

# 从当前目录开始递归
clean_in_dir "."
