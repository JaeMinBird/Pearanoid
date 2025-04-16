Write-Host "Pearanoid API Test Script"
Write-Host "======================="

# Test health endpoint
Write-Host "`nTesting health endpoint:"
try {
    $healthResponse = Invoke-WebRequest -Uri "http://localhost:8080/api/health" -Method GET -ErrorAction Stop
    Write-Host "Status: $($healthResponse.StatusCode) $($healthResponse.StatusDescription)"
    Write-Host "Response: $($healthResponse.Content)"
} catch {
    Write-Host "Error: $_"
    Write-Host "Status Code: $($_.Exception.Response.StatusCode)"
}

# Create sample vault
$vault = @{
    version = 1
    entries = @(
        @{
            id = "test-id-1"
            name = "Test Entry"
            username = "testuser"
            email = "test@example.com"
            password = "encrypted-password-data"
            section = "Personal"
            notes = "encrypted-notes-data"
        }
    )
}

# Convert vault to JSON
$vaultJson = $vault | ConvertTo-Json
Write-Host "`nJSON Payload:"
Write-Host $vaultJson

# Test save vault endpoint
Write-Host "`nTesting save vault endpoint:"
try {
    $saveResponse = Invoke-WebRequest -Uri "http://localhost:8080/api/vault" -Method POST -Body $vaultJson -ContentType "application/json" -ErrorAction Stop
    Write-Host "Status: $($saveResponse.StatusCode) $($saveResponse.StatusDescription)"
} catch {
    Write-Host "Error: $_"
    Write-Host "Status Code: $($_.Exception.Response.StatusCode)"
}

# Test get vault endpoint
Write-Host "`nTesting get vault endpoint:"
try {
    $getResponse = Invoke-WebRequest -Uri "http://localhost:8080/api/vault" -Method GET -ErrorAction Stop
    Write-Host "Status: $($getResponse.StatusCode) $($getResponse.StatusDescription)"
    Write-Host "Response length: $($getResponse.Content.Length) bytes"
    
    # Parse vault
    $retrievedVault = $getResponse.Content | ConvertFrom-Json
    Write-Host "Vault version: $($retrievedVault.version)"
    Write-Host "Number of entries: $($retrievedVault.entries.Length)"
    
    if ($retrievedVault.entries.Length -gt 0) {
        $entry = $retrievedVault.entries[0]
        Write-Host "First entry: $($entry.name) ($($entry.email))"
    }
} catch {
    Write-Host "Error: $_"
    Write-Host "Status Code: $($_.Exception.Response.StatusCode)"
}

Write-Host "`nAll tests completed." 