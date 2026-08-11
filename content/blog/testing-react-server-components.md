Server Components changed how I think about **data fetching** in React. Instead of client-side `useEffect` calls, components can be *async* by default.

## Why It Matters

Here's a quick comparison:

- Traditional CSR: fetch on mount, show a loading spinner, hope it resolves fast.
- RSC: fetch on the server, stream HTML, zero client-side waterfall.

<u>The biggest win</u> is bundle size — none of your data-fetching logic ships to the browser.

### A Minimal Example

```tsx
export default async function Page() {
  const data = await getData();
  return <div>{data.title}</div>;
}
```

That's it. No `useState`, no `useEffect`, no loading boilerplate.

For a key takeaway, <span style="font-size:1.4em">bigger text</span> can help it stand out without reaching for a full heading.

Read more in the [official docs](https://react.dev).
