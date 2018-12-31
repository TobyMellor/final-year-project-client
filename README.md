## Code Design Guidelines

#### Events and Services

Two Services should never talk to eachother directly in this application. They are separate.

If you need to trigger something in another service, dispatch an event.

**Dispatch Using**
```
Dispatcher.getInstance()
          .dispatch('EVENT_NAME', {
            data1: [],
            data2: [],
            somethingElse: [],
            datan: [],
          });
```

**Listen Using**
```
Dispatcher.getInstance()
          .on('EVENT_NAME', this, this.FUNCTION_NAME_HERE);
```

#### Services and API calls

Don't make API calls directly from services.

If you need to make an API call from a service, create a factory and do the API request from there.