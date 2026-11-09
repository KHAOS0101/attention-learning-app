param(
  [switch]$NoOpen
)

$siteRoot = [System.IO.Path]::GetFullPath($PSScriptRoot)
$rootPrefix = $siteRoot.TrimEnd([System.IO.Path]::DirectorySeparatorChar) + [System.IO.Path]::DirectorySeparatorChar
$prefix = 'http://127.0.0.1:8000/'
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($prefix)

try {
  $listener.Start()
} catch {
  Write-Error "Não foi possível iniciar o servidor em $prefix. Verifique se a porta 8000 já está em uso."
  exit 1
}

Write-Host "Attention Learning disponível em $prefix. Pressione Ctrl+C para encerrar."
if (-not $NoOpen) {
  Start-Process $prefix
}

while ($listener.IsListening) {
  $context = $listener.GetContext()
  $response = $context.Response

  try {
    $relativePath = [System.Uri]::UnescapeDataString($context.Request.Url.AbsolutePath.TrimStart('/'))
    if ([string]::IsNullOrWhiteSpace($relativePath)) {
      $relativePath = 'index.html'
    }

    $filePath = [System.IO.Path]::GetFullPath((Join-Path $siteRoot $relativePath))
    if (-not $filePath.StartsWith($rootPrefix, [System.StringComparison]::OrdinalIgnoreCase)) {
      $response.StatusCode = 400
      $body = [System.Text.Encoding]::UTF8.GetBytes('Caminho inválido.')
      $response.OutputStream.Write($body, 0, $body.Length)
      continue
    }

    if (-not (Test-Path -LiteralPath $filePath -PathType Leaf)) {
      $response.StatusCode = 404
      $body = [System.Text.Encoding]::UTF8.GetBytes('Arquivo não encontrado.')
      $response.OutputStream.Write($body, 0, $body.Length)
      continue
    }

    $extension = [System.IO.Path]::GetExtension($filePath).ToLowerInvariant()
    switch ($extension) {
      '.html' { $response.ContentType = 'text/html; charset=utf-8' }
      '.css' { $response.ContentType = 'text/css; charset=utf-8' }
      '.js' { $response.ContentType = 'text/javascript; charset=utf-8' }
      '.svg' { $response.ContentType = 'image/svg+xml' }
      default { $response.ContentType = 'application/octet-stream' }
    }

    $response.Headers.Add('Cache-Control', 'no-store')
    $body = [System.IO.File]::ReadAllBytes($filePath)
    $response.ContentLength64 = $body.Length
    $response.OutputStream.Write($body, 0, $body.Length)
  } catch {
    Write-Error "Falha ao servir $($context.Request.Url.AbsolutePath): $_"
    if (-not $response.OutputStream.CanWrite) {
      continue
    }
    $response.StatusCode = 500
  } finally {
    $response.Close()
  }
}
