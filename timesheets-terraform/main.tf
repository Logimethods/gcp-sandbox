module "cloud_function_1" {
    source = "./cloud-functions"

    cloud_function_definition = {
        function_name           = "function_name"
        function_description    = "function_description"
        function_memory         = 128
        function_timeout        = 30
        function_entry_point    = "function_entry_point"
        local_path              = "./nodejs_functions/function-1.js"
        bucket_name             = "bucket_name"
        bucket_archive_name     = "bucket_archive_name"
    }
}
/*
module "cloud_function_2" {
    source = "./cloud-functions"

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
}*/