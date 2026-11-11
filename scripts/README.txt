WINDOWS SETUP (PowerShell)

1. Install Git, Python, and Docker Desktop. Start Docker Desktop.
2. Clone repository if needed:
   cd $HOME
   git clone https://github.com/ghanshyam20/AI-assisted-python-learning-platform.git
   cd AI-assisted-python-learning-platform
3. Place both .ps1 files inside a folder named 'scripts' at the repository root.
4. First-time setup (run from repository root):
   powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\setup-windows.ps1
5. Start on later days:
   powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\start-windows.ps1

NOTE: The script does not run migrations because the project is awaiting its custom user model.
NOTE: The setup script copies backend/.env.example to backend/.env and generates SECRET_KEY. Other environment settings in the template must match your Docker Compose configuration.
NOTE: Each developer needs their own GitHub credentials for attributable contributions. Do not commit teammates' changes under your identity.
