resource "google_storage_bucket" "my_bucket" {
    name            = var.storage_bucket.name
    force_destroy   = var.storage_bucket.force_destroy
    location        = var.storage_bucket.location
}

resource "google_storage_bucket_object" "my_bucket_object" {
    for_each    = var.storage_bucket_objects

    name        = each.value.name
    bucket      = "${google_storage_bucket.my_bucket.name}"
    source      = each.value.source
}