# Post data straight to a pad

## Curl example
```
curl -X POST -d @/tmp/xbmc.log http://10.0.0.215:9001/post
```

You can also use the 'x-pad-id' header to define the resulting pad name or it will be randomized. Ex:
```
$ curl -X POST -d @datafile.txt -H 'X-PAD-ID: test123' http://10.0.0.215/post
Pad Created: http://10.0.0.215/p/test123
```

## Limitation
Etherpad Limits imports to 100k Characters
