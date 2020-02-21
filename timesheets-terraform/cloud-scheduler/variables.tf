variable "cloud_schedulers" {
    type    =   map(object({
        project         =  string
        name            =  string
        region          =  string
        timezone        =  string
        schedule        =  map(string)


        pubsub_target   = object({
            topic_name  =    string
            data        =   string
        })
    }))
}