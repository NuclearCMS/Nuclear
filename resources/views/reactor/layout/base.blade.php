<!DOCTYPE html>
<html lang="{{ App::getLocale() }}" class="no-js">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1.0, user-scalable=0">

    <title>@yield('pageTitle') &mdash; Nuclear</title>

    {!! Theme::css('css/app.css') !!}
    <link href='https://fonts.googleapis.com/css?family=Lato:400,700|Oxygen:400,700&subset=latin,latin-ext' rel='stylesheet' type='text/css'>

    {!! Theme::js('js/all.js') !!}
</head>
<body>

    @yield('body')

    @yield('scripts')

</body>
</html>