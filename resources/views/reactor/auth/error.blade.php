<p class="auth-error">
    @if(count($errors) > 0)
        @foreach($errors->all() as $error)
            {{ $error }}<br>
        @endforeach
    @endif
</p>