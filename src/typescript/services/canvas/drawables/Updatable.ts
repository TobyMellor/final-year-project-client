import { Math, Mesh } from 'three';

abstract class Updatable {
  protected abstract _namedMeshes: NamedMesh[];
  public abstract updatePosition(): void;

  protected createNamedMesh(geometry: THREE.Geometry, material: THREE.Material): NamedMesh {
    const mesh = new Mesh(geometry, material);
    const namedMesh = this.nameMesh(mesh);

    return namedMesh;
  }

  protected nameMesh(mesh: THREE.Mesh): NamedMesh {
    const UUID = Math.generateUUID();

    mesh.name = UUID;

    return {
      UUID,
      mesh,
    };
  }

  public getNamedMeshes(): NamedMesh[] {
    const namedMeshes = this._namedMeshes;

    return namedMeshes.filter(namedMesh => namedMesh !== null);
  }
}

export interface NamedMesh {
  UUID: string;
  mesh: THREE.Mesh;
}

export default Updatable;
