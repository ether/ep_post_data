# Create Pads from HTTP POST for Etherpad

POST data directly into an Etherpad pad via HTTP.

## Install

```
pnpm run plugins i ep_post_data
```

## Usage

POST to `/post` to create or update a pad. Set the `X-PAD-ID` header to choose the pad name, otherwise a random ID is generated.

```bash
# Create a pad with a random ID
curl -X POST -d @datafile.txt http://localhost:9001/post

# Create or update a specific pad
curl -X POST -d @datafile.txt -H 'X-PAD-ID: mypad' http://localhost:9001/post
```

## Limits

Request body is capped at 1 MB.

## License

Apache-2.0
