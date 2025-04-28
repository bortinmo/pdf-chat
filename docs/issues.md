Some things that I am aware would need to be improved:

### Using LangChain more

As mentioned in the README as well

### Prompt message mapping logic in page.tsx

This part below could go to the backend.

```typescript jsx
 // hydrate history on the first render
useEffect(() => {
  fetch('/api/history')
    .then(r => r.json())
    .then((rows: any[]) => {
      const history = rows.flatMap(row => [
        {
          id: `q-${row.id}`,
          role: 'user',
          content: row.question,
        },
        {
          id: `a-${row.id}`,
          role: 'assistant',
          content: row.answer,
        },
      ] as const)
      setMessages(history)
    })
    .catch(console.error)
}, [setMessages])
```

And reconsider the whole approach.
(Assessment was about saving only user prompt, not the conversation.
If saving conversation, better keep the original data structure.)

### OOP and manual Dependency Injection under lib

I was trying to find a way to not construct all objects from one file,
to allow using part of the object graph as well.
This is why I added the .instance.ts files, but I see this isn't the best either.
So I would likely check out DI frameworks for TS.

Or go with a more straightforward approach and export the singleton from the file with the class/functions itself.
(Downside is less proper object dependency management)

And could also go for a more functional style, instead of the interfaces/classes.