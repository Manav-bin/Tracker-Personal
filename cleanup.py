import os
import shutil

# Customize these folders and files to delete
CLEANUP_TARGETS = [
    'node_modules',
    'build',
    'dist',
    '__pycache__',
    '.vscode',
    '.idea',
    'uploads',
    '*.log',
    '*.sqlite3',
    '.DS_Store',
    'env',
    'venv',
    'env.bak',
    'venv.bak',
    '*.pyc',
    '*.pyo',
    '*.pyd',
]

def matches_pattern(filename, pattern):
    import fnmatch
    return fnmatch.fnmatch(filename, pattern)

def cleanup_folder(root_dir):
    print(f"Cleaning up {root_dir} ...")
    for dirpath, dirnames, filenames in os.walk(root_dir, topdown=False):
        # Remove folders matching any target name
        for folder in list(dirnames):
            if folder in CLEANUP_TARGETS:
                full_path = os.path.join(dirpath, folder)
                shutil.rmtree(full_path)
                print(f"Removed directory: {full_path}")
                dirnames.remove(folder)  # prevent descending into removed dir

        # Remove files matching any target pattern
        for file in filenames:
            for pattern in CLEANUP_TARGETS:
                if '*' in pattern and matches_pattern(file, pattern):
                    full_path = os.path.join(dirpath, file)
                    os.remove(full_path)
                    print(f"Removed file: {full_path}")
                    break

if __name__ == "__main__":
    # Change to your project root or current dir
    cleanup_folder(".")

    print("Cleanup complete. Your folder is ready for git.")
