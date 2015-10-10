@extends('layout.content')

@section('pageTitle', trans('users.search_permissions'))
@section('contentSubtitle')
    <a href="/reactor/permissions">
        {{ uppercase(trans('users.permissions')) }}
    </a>
@endsection

@section('content_options')
    @include('partials.content.bigsearch', ['result_count' => $permissions->count()])
@endsection

@section('content_sortable_links')
    <th>
        {{ uppercase(trans('validation.attributes.name')) }}
    </th>
@endsection

@section('content_list')
    @if($permissions->count())
        @include('permissions.content')
    @else
        {!! no_results_row() !!}
    @endif
@endsection

@section('content_footer')
    <a class="button back-link" href="/reactor/permissions">
        <i class="icon-left-thin"></i>{{ trans('users.all_permissions') }}
    </a>
@endsection