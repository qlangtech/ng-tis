#!/bin/bash
#
# libstdc++ 升级脚本
# 用于解决 Node.js 运行时缺少 GLIBCXX_3.4.20/21 和 CXXABI_1.3.9 的问题
#
# 使用方法:
#   chmod +x upgrade_libstdcxx.sh
#   sudo ./upgrade_libstdcxx.sh
#

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}libstdc++ 库升级脚本${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# 检查是否以 root 权限运行
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}错误: 请使用 sudo 运行此脚本${NC}"
    exit 1
fi

# 1. 备份当前的库文件
echo -e "${YELLOW}步骤 1: 备份当前的 libstdc++.so.6 库文件...${NC}"
if [ -f /usr/lib64/libstdc++.so.6 ]; then
    cp -v /usr/lib64/libstdc++.so.6 /usr/lib64/libstdc++.so.6.backup.$(date +%Y%m%d_%H%M%S)
    echo -e "${GREEN}✓ 备份完成${NC}"
else
    echo -e "${RED}错误: 找不到 /usr/lib64/libstdc++.so.6${NC}"
    exit 1
fi

# 2. 显示当前版本信息
echo ""
echo -e "${YELLOW}步骤 2: 检查当前库版本...${NC}"
CURRENT_LIB=$(readlink -f /usr/lib64/libstdc++.so.6)
echo "当前库文件: $CURRENT_LIB"
echo ""
echo "当前支持的 GLIBCXX 版本:"
strings $CURRENT_LIB | grep GLIBCXX | sort -V | tail -5
echo ""
echo "当前支持的 CXXABI 版本:"
strings $CURRENT_LIB | grep CXXABI | sort -V | tail -5
echo ""

# 3. 创建临时工作目录
WORK_DIR="/tmp/libstdcxx_upgrade_$$"
mkdir -p $WORK_DIR
cd $WORK_DIR
echo -e "${YELLOW}步骤 3: 创建临时工作目录 $WORK_DIR${NC}"

# 4. 下载新版本的 libstdc++
echo ""
echo -e "${YELLOW}步骤 4: 下载新版本的 libstdc++ 库...${NC}"

# 从 CentOS 8 下载包含完整库文件的 libstdc++
echo "尝试从 CentOS 8 获取新版本库..."

# 定义多个下载源
# 使用 CentOS 8 的 libstdc++, 包含完整的运行时库 libstdc++.so.6.0.25 (支持 GLIBCXX_3.4.25+, CXXABI_1.3.11+)
LIBSTDCXX_RPM="libstdc++-8.5.0-4.el8_5.x86_64.rpm"

declare -a MIRROR_URLS=(
   # "http://vault.centos.org/8.5.2111/BaseOS/x86_64/os/Packages/${LIBSTDCXX_RPM}"
    "http://mirrors.aliyun.com/centos-vault/8.5.2111/BaseOS/x86_64/os/Packages/${LIBSTDCXX_RPM}"
    "http://mirrors.163.com/centos-vault/8.5.2111/BaseOS/x86_64/os/Packages/${LIBSTDCXX_RPM}"
    "http://ftp.iij.ad.jp/pub/linux/centos-vault/8.5.2111/BaseOS/x86_64/os/Packages/${LIBSTDCXX_RPM}"
)

DOWNLOAD_SUCCESS=0

for MIRROR_URL in "${MIRROR_URLS[@]}"; do
    echo ""
    echo "正在尝试: $MIRROR_URL"

    if wget -q --timeout=30 --tries=2 "$MIRROR_URL"; then
        echo -e "${GREEN}✓ 下载成功${NC}"
        DOWNLOAD_SUCCESS=1
        break
    else
        echo -e "${YELLOW}下载失败,尝试下一个镜像...${NC}"
    fi
done

if [ $DOWNLOAD_SUCCESS -eq 0 ]; then
    echo ""
    echo -e "${RED}错误: 所有镜像源都下载失败${NC}"
    echo ""
    echo "你可以手动下载 RPM 包并放到当前目录,然后重新运行脚本:"
    echo "  wget http://vault.centos.org/8.5.2111/BaseOS/x86_64/os/Packages/${LIBSTDCXX_RPM}"
    echo "  或者访问: https://vault.centos.org/8.5.2111/BaseOS/x86_64/os/Packages/"
    echo ""
    exit 1
fi

# 解压 RPM 包并检查是否包含 libstdc++
echo ""
echo "正在解压 RPM 包...: ${LIBSTDCXX_RPM}"

# 保存解压输出到变量
EXTRACT_OUTPUT=$(rpm2cpio $LIBSTDCXX_RPM | cpio -idmv 2>&1)

# 检查解压输出中是否包含 libstdc++
if echo "$EXTRACT_OUTPUT" | grep -q libstdc++; then
    echo -e "${GREEN}✓ 解压成功,发现 libstdc++ 文件${NC}"
    echo "$EXTRACT_OUTPUT" | grep libstdc++
else
    echo -e "${RED}错误: RPM 包中未找到 libstdc++ 相关文件!${NC}"
    echo ""
    echo "解压的完整内容:"
    echo "$EXTRACT_OUTPUT"
    echo ""
    echo "可能的原因:"
    echo "  1. 下载的 RPM 包不正确或已损坏"
    echo "  2. RPM 包版本不包含所需的 libstdc++ 文件"
    echo ""
    echo "请检查下载的 RPM 包: $LIBSTDCXX_RPM"
    echo "文件大小: $(ls -lh $LIBSTDCXX_RPM | awk '{print $5}')"
    exit 1
fi

echo -e "${GREEN}rpm2cpio complete${NC}"

# 查找新的 libstdc++ 文件
# CentOS 8 的 libstdc++ 路径通常是: ./usr/lib64/libstdc++.so.6.0.25
NEW_LIB=$(find $WORK_DIR -name "libstdc++.so.6.0.*" -type f | head -1)
echo "NEW_LIB: ${NEW_LIB}"

if [ -z "$NEW_LIB" ]; then
    echo -e "${RED}错误: 未找到新的 libstdc++ 库文件${NC}"
    echo ""
    echo "正在搜索所有 libstdc++ 相关文件:"
    find $WORK_DIR -name "*libstdc*" -type f
    echo ""
    echo "RPM 包中的 libstdc 相关内容:"
    rpm2cpio $LIBSTDCXX_RPM | cpio -t 2>&1 | grep -i libstdc
    exit 1
fi

echo "找到新库文件: $NEW_LIB"

# 5. 检查新库版本
echo ""
echo -e "${YELLOW}步骤 5: 检查新库版本...${NC}"
echo "新库文件: $NEW_LIB"
echo ""
echo "新库支持的 GLIBCXX 版本:"
strings $NEW_LIB | grep GLIBCXX | sort -V | tail -5
echo ""
echo "新库支持的 CXXABI 版本:"
strings $NEW_LIB | grep CXXABI | sort -V | tail -5
echo ""

# 验证新库是否包含所需版本
if strings $NEW_LIB | grep -q "GLIBCXX_3.4.21" && strings $NEW_LIB | grep -q "CXXABI_1.3.9"; then
    echo -e "${GREEN}✓ 新库包含所需的版本${NC}"
else
    echo -e "${RED}错误: 新库不包含所需的版本,升级可能无效${NC}"
    read -p "是否继续? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# 6. 安装新库
echo ""
echo -e "${YELLOW}步骤 6: 安装新库文件...${NC}"

# 获取新库的文件名
NEW_LIB_NAME=$(basename $NEW_LIB)

# 复制新库文件到系统目录
echo "复制 $NEW_LIB 到 /usr/lib64/"
cp -v $NEW_LIB /usr/lib64/

# 更新软链接
echo "更新软链接..."
rm -f /usr/lib64/libstdc++.so.6
ln -sv /usr/lib64/$NEW_LIB_NAME /usr/lib64/libstdc++.so.6

# 更新动态链接器缓存
echo "更新动态链接器缓存..."
ldconfig

echo -e "${GREEN}✓ 安装完成${NC}"

# 7. 验证安装
echo ""
echo -e "${YELLOW}步骤 7: 验证安装...${NC}"
echo "当前 libstdc++.so.6 指向:"
ls -l /usr/lib64/libstdc++.so.6
echo ""
echo "最终支持的 GLIBCXX 版本:"
strings /usr/lib64/libstdc++.so.6 | grep GLIBCXX | sort -V | tail -5
echo ""
echo "最终支持的 CXXABI 版本:"
strings /usr/lib64/libstdc++.so.6 | grep CXXABI | sort -V | tail -5
echo ""

# 8. 清理临时文件
echo -e "${YELLOW}步骤 8: 清理临时文件...${NC}"
cd /
rm -rf $WORK_DIR
echo -e "${GREEN}✓ 清理完成${NC}"

# 9. 完成
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}升级完成!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "现在可以尝试运行: node -v"
echo ""
echo "如果遇到问题,可以恢复备份:"
echo "  sudo cp /usr/lib64/libstdc++.so.6.backup.* /usr/lib64/libstdc++.so.6"
echo "  sudo ldconfig"
echo ""
