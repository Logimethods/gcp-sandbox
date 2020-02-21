variable "cloud_function_definitions" {
    type    = map(object({
        name                  = string
        source_archive_bucket = string
        source_archive_object = string
        trigger_http          = bool
        runtime               = string
        entry_point           = string
        region                = string
        event_trigger         = object({
            event_type  = string 
            resource    = string
        })
    }))
    
    default = {
        a={
            name                  = "default-name"
            source_archive_bucket = "default-source_archive_bucket"
            source_archive_object = "default-source_archive_object"
            trigger_http          = null
            runtime               = "default-runtime"
            entry_point           = "default-entry_point"
            region                = "default-region"
            event_trigger = null
        }
    }
}
