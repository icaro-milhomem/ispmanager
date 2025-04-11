export default {
  apps: [{
    name: 'ispmanager-frontend',
    script: 'npm',
    args: 'run preview',
    env: {
      PORT: 5173,
      HOST: '0.0.0.0',
      VITE_APP_URL: 'http://sys.econect.eco.br',
      NODE_ENV: 'production'
    },
    instances: 1,
    exec_mode: 'fork',
    watch: false,
    max_memory_restart: '500M',
    error_file: 'logs/err.log',
    out_file: 'logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    merge_logs: true,
    autorestart: true,
    cwd: "/root/ispmanager/frontend"
  }]
}; 