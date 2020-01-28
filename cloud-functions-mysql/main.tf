module "cloudfunctions" {
    source = "./cloud-functions"
    cloud_function = [
        {
        function_name           = "function_name"
        function_description    = "function_description"
        function_memory         = 128
        function_timeout        = 30
        function_entry_point    = "function_entry_point"
        local_path              = "function-1.js"
        bucket_name             = "bucket_name"
        bucket_archive_name     = "bucket_archive_name"
    }
    ]
    cloud_function_definition = {
        function_name           = "function_name"
        function_description    = "function_description"
        function_memory         = 128
        function_timeout        = 30
        function_entry_point    = "function_entry_point"
        local_path              = "function-1.js"
        bucket_name             = "bucket_name"
        bucket_archive_name     = "bucket_archive_name"
    }
}