  
# Upload function (object) in Cloud Storage
# https://www.terraform.io/docs/providers/google/r/storage_bucket_object.html
resource "google_storage_bucket_object" "db_function" {
    count   = length(var.cloud_function)
    name    = var.cloud_function.cloud_function_definition[count.index].function_name
    bucket    = var.cloud_function_definition[count.index].function_name
    source    = var.cloud_function_definition[count.index].function_name    

}


/*
# Create new CloudFunction
# https://www.terraform.io/docs/providers/google/r/cloudfunctions_function.html
resource "google_cloudfunctions_function" "function" {
  name                  = "${var.function_name}"
  description           = "${var.function_description}"
  available_memory_mb   = "${var.function_memory}"
  source_archive_bucket = "${var.bucket_name}"
  source_archive_object = "${google_storage_bucket_object.archive_function.name}"
  trigger_http          = true
  timeout               = "${var.function_timeout}"
  entry_point           = "${var.function_entry_point}"
}
*/