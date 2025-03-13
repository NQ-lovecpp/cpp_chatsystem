import os

def is_image_dir(path):
    return os.path.basename(os.path.normpath(path)) == "image"

def process_source_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return f.read()
    except Exception as e:
        return f"【无法读取文件内容，可能是二进制文件或编码问题：{e}】"

def main():
    output_filename = "all_extracted_code.txt"
    with open(output_filename, 'w', encoding='utf-8') as out_file:
        # 从当前目录开始递归遍历
        for root, dirs, files in os.walk('.'):
            # 排除名为 build 的目录
            if 'build' in dirs:
                dirs.remove('build')
            if 'conf' in dirs:
                dirs.remove('conf')
            if 'docker_image_data' in dirs:
                dirs.remove('docker_image_data')
            if 'odb_builds' in dirs:
                dirs.remove('odb_builds')
            if 'api_builds' in dirs:
                dirs.remove('api_builds')

            relative_root = os.path.relpath(root, '.')
            # 判断当前目录是否为 image 目录
            if is_image_dir(root):
                for filename in files:
                    rel_path = os.path.join(relative_root, filename)
                    out_file.write(f"--- IMAGE FILE: {rel_path} ---\n")
                    out_file.write(f"文件名: {filename}\n\n")
            else:
                for filename in files:
                    rel_path = os.path.join(relative_root, filename)
                    out_file.write(f"--- FILE: {rel_path} ---\n")
                    content = process_source_file(os.path.join(root, filename))
                    out_file.write("内容:\n")
                    out_file.write(content + "\n\n")

if __name__ == '__main__':
    main()
