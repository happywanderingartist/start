$ErrorActionPreference='Stop'
$taskDir=$PSScriptRoot
$modelDir=Join-Path $taskDir 'local-extractor'
$mapDir=Join-Path (Split-Path $taskDir -Parent) 'START_AMAP_INTEGRATION_2026-10-07'
$nodePath=(Get-Command node -ErrorAction Stop).Source
function Listening($port){return [bool](Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue)}
if(!(Test-Path -LiteralPath "$modelDir\qwen2.5-1.5b-instruct-q4_k_m.gguf")){throw 'Local model is missing. Restore the verified model file before starting.'}
if(!(Listening 4328)){
 $argsLine='-m "'+$modelDir+'\qwen2.5-1.5b-instruct-q4_k_m.gguf" --host 127.0.0.1 --port 4328 -c 8192 -t 4 -np 1 --alias start-extractor --no-ui --no-agent --cors-origins http://127.0.0.1:4327 --log-disable'
 Start-Process -FilePath "$modelDir\llama-b11429\llama-server.exe" -ArgumentList $argsLine -WorkingDirectory "$modelDir\llama-b11429" -WindowStyle Hidden -RedirectStandardOutput "$modelDir\model1_5b.stdout.log" -RedirectStandardError "$modelDir\model1_5b.stderr.log" | Out-Null
}
if(!(Listening 4325)){Start-Process -FilePath $nodePath -ArgumentList 'server.mjs' -WorkingDirectory $mapDir -WindowStyle Hidden -RedirectStandardOutput "$mapDir\server.log" -RedirectStandardError "$mapDir\server.stderr.log" | Out-Null}
if(!(Listening 4327)){Start-Process -FilePath $nodePath -ArgumentList 'server.mjs' -WorkingDirectory $taskDir -WindowStyle Hidden -RedirectStandardOutput "$taskDir\server.stdout.log" -RedirectStandardError "$taskDir\server.stderr.log" | Out-Null}
$modelReady=$false
for($attempt=0;$attempt -lt 15;$attempt++){
 try{$modelReady=(Invoke-WebRequest 'http://127.0.0.1:4328/health' -UseBasicParsing -TimeoutSec 2).StatusCode -eq 200}catch{}
 if($modelReady){break};Start-Sleep -Seconds 1
}
if(!$modelReady){throw 'Local model is not ready. Existing listeners were preserved; inspect model1_5b.stderr.log.'}
$status=Invoke-RestMethod 'http://127.0.0.1:4327/api/extract/status'
if(!$status.ready){throw 'Admin adapter cannot reach the local model.'}
Write-Output 'START text import: http://127.0.0.1:4327/#route'
Write-Output ('Local extractor ready: '+$status.model)
