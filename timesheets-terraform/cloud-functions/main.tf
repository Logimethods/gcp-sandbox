  
# Upload function (object) in Cloud Storage
# https://www.terraform.io/docs/providers/google/r/storage_bucket_object.html
resource "google_storage_bucket_object" "db_function" {
    name    = "${lookup(var.cloud_function_definition, "bucket_archive_name")}"
    bucket  = "${lookup(var.cloud_function_definition, "bucket_name")}"
    source  = "${lookup(var.cloud_function_definition, "local_path")}"
}



# Create new CloudFunction
# https://www.terraform.io/docs/providers/google/r/cloudfunctions_function.html
resource "google_cloudfunctions_function" "function" {
  name                  = "${lookup(var.cloud_function_definition, "function_name")}"
  description           = "${lookup(var.cloud_function_definition, "function_description")}"
  available_memory_mb   = "${lookup(var.cloud_function_definition, "function_memory")}"
  source_archive_bucket = "${lookup(var.cloud_function_definition, "bucket_name")}"
  source_archive_object = "${lookup(var.cloud_function_definition, "bucket_archive_name")}"
  trigger_http          = true
  runtime               = "nodejs8"
  timeout               = "${lookup(var.cloud_function_definition, "function_timeout")}"
  entry_point           = "${lookup(var.cloud_function_definition, "function_entry_point")}"
}
