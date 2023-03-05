# @ngrx/store with indexed db

This is just a proof of concept for synchronizing @ngrx/store with indexed-db 

- within this example if you would increment the counter and refresh the page the counter should be the same value
- Similarly for the lazy loaded route/feature this should be the case
- It should also synchronize back when you are in another tab and changed to another tab

One limitation of this small example is that if the lazy route is not loaded yet, and the store is not initialized for that feature.
You will overwrite the lazy state if you execute a action before the lazy route is initialized

example:

- root counter = 5, lazy counter = 2
- go to home page
- refresh
- go to lazy route
- verify the counter is 2

all good this case, now if we do the same:

- root counter = 5, lazy counter = 2
- go to home page
- refresh
- **press increment button**
- go to lazy route
- **the counter shown is now 0, while the indexed-db is having 2 ( on refresh it will be correct again...)**