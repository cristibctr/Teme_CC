for($i=0;$i -lt 5; $i=$i+1)
{
    Write-Output "Starting the batch"
    $Jobs = for($j=0;$j -lt 5; $j=$j+1)
    {
        start-job -ScriptBlock { 
            $StartTime = $(get-date)
            Invoke-WebRequest -Uri "http://127.0.0.1:8001/api" >$null
            Write-Output ("{0}" -f ($(get-date)-$StartTime))}
    }
    Write-Output "Batch sent... waiting for responses"
    Wait-Job $Jobs >$null
    $Output = Receive-Job $Jobs
    foreach ($item in $output){
        write-host $item
    }
}