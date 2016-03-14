<?php

namespace Reactor\Nodes;

use Kenarkose\Chronicle\RecordsActivity;
use Kenarkose\Sortable\Sortable;
use Nicolaslopezj\Searchable\SearchableTrait;
use Nuclear\Hierarchy\NodeType as HierarchyNodeType;

class NodeType extends HierarchyNodeType
{
    use Sortable, SearchableTrait, RecordsActivity;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = ['name', 'label', 'description',
        'visible', 'hides_children', 'color', 'taggable'];

    /**
     * Sortable columns
     *
     * @var array
     */
    protected $sortableColumns = ['name', 'label'];

    /**
     * Default sortable key
     *
     * @var string
     */
    protected $sortableKey = 'name';

    /**
     * Default sortable direction
     *
     * @var string
     */
    protected $sortableDirection = 'asc';

    /**
     * Searchable columns.
     *
     * @var array
     */
    protected $searchable = [
        'columns' => [
            'name'  => 10,
            'label' => 10
        ]
    ];

}
