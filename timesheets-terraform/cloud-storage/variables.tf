#
variable "storage_bucket" {
    type    = object({
        name            = string
        force_destroy   = bool
        location        = string
    })
}
variable "storage_bucket_objects" {
    type    = map(object({
        name        = string
        source      = string
    }))
}