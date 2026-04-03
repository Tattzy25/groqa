import axios from "axios";
import mcpServers from "./mcp-servers.json";

interface MCPServer {
  name: string;
  url: string;
  headers?: Record<string, string>;
}

class MCPClient {
  async callMCPServer(serverName: string, functionName: string, params: any) {
    const server: MCPServer | undefined = (mcpServers as any)[
      "mcp-servers"
    ].find((s: MCPServer) => s.name === serverName);
    
    if (!server) {
      throw new Error(`MCP server not found: ${serverName}`);
    }

    const headers: Record<string, string> = {};
    if (server.headers) {
      for (const [key, value] of Object.entries(server.headers)) {
        headers[key] = value.replace(/\${(\w+)}/g, (_, varName) => {
          return process.env[varName] || "";
        });
      }
    }

    const response = await axios.post(
      server.url,
      {
        functionName,
        params,
      },
      { headers },
    );
    return response.data;
  }
}

export default MCPClient;
