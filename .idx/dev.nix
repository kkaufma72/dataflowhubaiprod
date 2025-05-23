{pkgs}: {
  channel = "stable-24.05";
  packages = [
    pkgs.nodejs_20
    pkgs.supabase-cli
  ];

  # Supabase Environment Variables
  env = {
    SUPABASE_ACCESS_TOKEN = "sbp_aa99891b6fa3bbb004f4ae71193d74e00ff8295c"; # Your Personal Access Token
    SUPABASE_URL = "https://wmxfzowazxyefmtdfrwd.supabase.co";
    SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndteGZ6b3dhenh5ZWZtdGRmcndkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMyNDkzNTIsImV4cCI6MjA1ODgyNTM1Mn0.tCxkDkUVyZhy1EE41RfC4CgRO6fTf_UXfZADwt-fZDs";
    SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndteGZ6b3dhenh5ZWZtdGRmcndkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MzI0OTM1MiwiZXhwIjoyMDU4LLOwMDE3NTI4ODV9.o7e3jD6L3a5eA9o3E2y5R9o4U1i7M7y4t4b6h9h0m0c";
  };

  idx.extensions = [
    "svelte.svelte-vscode"
    "vue.volar"
    "denoland.vscode-deno"
  ];
  idx.previews = {
    previews = {
      web = {
        command = [
          "npm"
          "run"
          "dev"
          "--"
          "--port"
          "$PORT"
          "--host"
          "0.0.0.0"
        ];
        manager = "web";
      };
    };
  };
}