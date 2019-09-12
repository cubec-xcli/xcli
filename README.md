# XCLI

[XCLI] Front-end automation build tool integration


## Documentation

under construction...


### How To Install？

clone project

```sh
git clone https://github.com/cubec-xcli/xcli.git
```

run npm link
```sh
npm link
```

check install (xcli --help)
```sh
xcli -h
```


### Set XCLI remote plugin

try to install plugin (from origin github:cubec-xcli)

```
xcli plugin install test-xcli-plugin
```

You can set the source of the installation plugin according to the developer's own needs.

If you don't set the plugin source, XCLI will use the plugin of the ``cubec-xcli`` project group under github by default, meaning that the source of your plugins comes from the ``github:cubec-xcli`` project group.


```sh
xcli set-remote-plugin config.json
```

```javascript
// [config.json]
// only support gitlab and github
{
  // git type [github or gitlab]
  "pluginSourceGit": "gitlab",

  // git repository domain
  "pluginSourceGitPath": "www.yourpersonal-gitlab.com",

  // git repository domain/group
  "pluginSourceGroup": "xcli",
}
```

